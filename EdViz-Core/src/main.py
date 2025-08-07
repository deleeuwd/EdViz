from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends, Query, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
import logging
from pathlib import Path
import os
from dotenv import load_dotenv
import uuid
import sys
import io
from typing import List, Optional
from sqlmodel import Session, select, text
import re

from pdf_processor import PDFProcessor
from ai_processor import AIProcessor
from graph_generator import GraphGenerator

from database import get_session
from models import Graph
from datetime import datetime
from open_in_new_tab import router as open_in_new_tab_router

from email_service import EmailService

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Create a StreamHandler that forces UTF-8 encoding for console output
# Ensure this is defined before basicConfig if it's used there.
# For safety, let's define it globally or right before basicConfig.
# We will create it inside the basicConfig call for simplicity now,
# but a more structured approach might define handlers separately.

# Configure logging
# Prepare console handler with UTF-8
console_stream = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
console_handler = logging.StreamHandler(console_stream)

logging.basicConfig(
    level=logging.DEBUG if os.getenv("LOG_LEVEL") == "DEBUG" else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        console_handler # Use the UTF-8 console handler
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Graph Management API",
    description="API for managing graph data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(open_in_new_tab_router)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("output")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Initialize processors
pdf_processor = PDFProcessor()
ai_processor = AIProcessor()
graph_generator = GraphGenerator()

# Initialize email service
email_service = EmailService()

# Contact form request model
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class RenderGraphRequest(BaseModel):
    graph_json: Dict[str, Any]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/graphs")
def create_graph(graph: Graph, db: Session = Depends(get_session)):
    """Create a new graph"""
    db.add(graph)
    db.commit()
    db.refresh(graph)
    return graph

@app.get("/graphs", response_model=List[Graph])
def read_graphs(limit: int = 10, offset: int = 0, db: Session = Depends(get_session)):
    """Get recent graphs, ordered by creation date"""
    result = db.execute(
        select(Graph)
        .order_by(Graph.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()

@app.get("/graphs/search", response_model=List[Graph])
def search_graphs(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_session)
):
    logger.info(f"[search_graphs] Raw query param: q='{q}'")
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    sanitized_query = re.sub(r"[^\w\s\-_'\"]", "", q)
    if not sanitized_query:
        raise HTTPException(status_code=400, detail="Invalid search query.")

    try:
        search_query = text("""
            SELECT * FROM search_graphs(:query)
        """)

        logger.info(f"[search_graphs] Executing DB search with query: '{sanitized_query}'")
        result = db.execute(search_query, {"query": sanitized_query})
        rows = result.fetchall()
        logger.info(f"[search_graphs] Raw DB rows: {rows}")
        return [Graph.model_validate(row._mapping) for row in rows]
    except Exception as e:
        logger.error(f"[search_graphs] Database error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during search.")


@app.get("/graphs/{graph_id}", response_model=Graph)
def read_graph(graph_id: uuid.UUID, db: Session = Depends(get_session)):
    """Get a specific graph"""
    result = db.execute(select(Graph).where(Graph.id == graph_id))
    graph = result.scalar_one_or_none()
    if graph is None:
        raise HTTPException(status_code=404, detail="Graph not found")
    return graph

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...), db: Session = Depends(get_session),
    graph_type: str = Form("mermaid")  # Default to mermaid if not specified
):
    """
    Upload and process a PDF file
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        if graph_type not in ["mermaid", "force"]:
            raise HTTPException(status_code=400, detail="graph_type must be either 'mermaid' or 'force'")
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{unique_id}.pdf"
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Successfully uploaded file: {file.filename}")
        
        # Process PDF
        pdf_data = pdf_processor.process_pdf(file_path)
        logger.debug(f"PDF data: {pdf_data}")
        
        # Generate comprehensive text
        logger.debug(f"Generating comprehensive text")
        comprehensive_text = await ai_processor.generate_comprehensive_text(pdf_data["text"])
        logger.debug(f"Comprehensive text: {comprehensive_text}")
        
        # Generate graph JSON
        graph_json = await ai_processor.generate_graph_json(comprehensive_text)
        logger.debug(f"Graph JSON: {graph_json}")
        
        new_graph = Graph(
            title=Path(file.filename).stem,  # Always use PDF filename without extension as title
            summary_text=comprehensive_text,
            graph_data=graph_json,
            created_at=datetime.utcnow()
        )
        db.add(new_graph)
        db.commit()
        db.refresh(new_graph)

        response = {
            "message": "File processed successfully",
            "graph_id": str(new_graph.id),
            "graph_json": graph_json
        }
        
        # Generate SVG only for mermaid graph type
        if graph_type == "mermaid":
            # Generate SVG
            svg_path = graph_generator.generate_svg(graph_json, unique_id)
            logger.debug(f"SVG path: {svg_path}")
            
            # Get the SVG file content
            svg_path = Path(f"output/{unique_id}.svg")
            if not svg_path.exists():
                raise HTTPException(status_code=404, detail="SVG file not found")
                
            with open(svg_path, "r") as f:
                svg_content = f.read()
                
            response["svg_content"] = svg_content
            
        return response
    
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-svg/{file_id}")
async def get_svg(file_id: str):
    """Get the generated SVG file"""
    try:
        svg_path = OUTPUT_DIR / f"{file_id}.svg"
        if not svg_path.exists():
            raise HTTPException(status_code=404, detail="SVG file not found")
        return FileResponse(svg_path, media_type="image/svg+xml")
    except Exception as e:
        logger.error(f"Error retrieving SVG file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contact")
async def contact_form(request: ContactRequest):
    """
    Handle contact form submissions
    """
    try:
        success = email_service.send_contact_email(
            name=request.name,
            email=request.email,
            subject=request.subject,
            message=request.message
        )
        
        if success:
            return {
                "message": "Thank you for your message. We'll get back to you soon!",
                "status": "success"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send message. Please try again later."
            )
            
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your message."
        )

@app.post("/render-graph")
async def render_graph(request: RenderGraphRequest):
    """
    Render a Mermaid SVG from a graph JSON structure
    """
    try:
        # Generate a temporary unique filename (not saved for reuse)
        temp_id = str(uuid.uuid4())
        svg_path = graph_generator.generate_svg(request.graph_json, temp_id)
        if not svg_path or not Path(svg_path).exists():
            raise HTTPException(status_code=500, detail="Failed to generate SVG")
        with open(svg_path, "r") as f:
            svg_content = f.read()
        # Optionally, clean up the temp files (SVG and .mmd)
        try:
            Path(svg_path).unlink(missing_ok=True)
            Path(f"output/{temp_id}.mmd").unlink(missing_ok=True)
        except Exception as cleanup_err:
            logger.warning(f"Failed to clean up temp files: {cleanup_err}")
        return {"svg_content": svg_content}
    except Exception as e:
        logger.error(f"Error rendering graph SVG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 