from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uuid
import logging
from pathlib import Path
from graph_generator import GraphGenerator

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize graph generator
graph_generator = GraphGenerator()

# Define request models
class Node(BaseModel):
    id: str
    name: str
    group: int

class Link(BaseModel):
    type: str
    source: str
    target: str
    description: str

class GraphData(BaseModel):
    nodes: List[Node]
    links: List[Link]

@router.post("/graphs/generate-svg")
async def generate_svg(graph_data: GraphData):
    """
    Generate SVG from graph data.
    
    Args:
        graph_data: Graph data containing nodes and links
        
    Returns:
        dict: Contains the generated SVG content
    """
    try:
        # Generate a unique ID for this graph
        unique_id = str(uuid.uuid4())
        
        # Convert Pydantic model to dict for graph generator
        graph_json = {
            "nodes": [node.dict() for node in graph_data.nodes],
            "links": [link.dict() for link in graph_data.links]
        }
        
        # Generate SVG using the existing graph generator
        svg_path = graph_generator.generate_svg(graph_json, unique_id)
        
        if not svg_path:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate SVG file"
            )
        
        # Read the generated SVG file
        with open(svg_path, "r", encoding="utf-8") as f:
            svg_content = f.read()
        
        return {
            "svg_content": svg_content
        }
        
    except Exception as e:
        logger.error(f"Error generating SVG: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating SVG: {str(e)}"
        ) 