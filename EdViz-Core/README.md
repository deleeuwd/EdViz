# PDF Concept Graph Generator

A FastAPI-based server that processes PDF files and generates concept graphs using AI. The server extracts text from PDFs, processes it using DeepSeek AI, and generates visual concept graphs using either Mermaid or Force-directed graphs.

## Features

- PDF text extraction and cleaning
- AI-powered concept analysis using DeepSeek
- Multiple graph visualization options:
  - Mermaid graphs (SVG output)
  - Force-directed graphs (D3.js compatible)
- Contact form with email notifications
- Rate limiting and error handling
- Comprehensive logging
- Health check endpoint

## Prerequisites

- Python 3.8+
- Node.js (for Mermaid CLI)
- DeepSeek API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd concept-back
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update the `.env` file with your DeepSeek API key and other configurations.

## Database Setup

1. Install PostgreSQL
- Visit https://www.postgresql.org/download/
- Download and install the version appropriate for your operating system
- During installation, set a password for the default `postgres` user and remember it

2. Configure Environment Variables
Add the following to your `.env` file:
```env
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edviz
```
Replace `your_postgres_password` with the password you set during PostgreSQL installation.

3. Set Up Database with pgAdmin
1. Install pgAdmin:
   - Visit https://www.pgadmin.org/download/
   - Download and install the version for your operating system

2. Connect to PostgreSQL:
   - Launch pgAdmin
   - Right-click on "Servers" → Create → Server...
   - Under the General tab:
     - Name: edvizdb
   - Under the Connection tab:
     - Host name/address: localhost
     - Port: 5432
     - Username: postgres
     - Password: your_postgres_password (the one you set during PostgreSQL installation)
   - Click "Save"

3. Create the Database:
   - In pgAdmin, expand your server
   - Right-click on "Databases"
   - Select "Create" → "Database"
   - Enter "edviz" as the database name
   - Click "Save"

4. Create Tables:
   - In pgAdmin 4, expand your database
   - Right-click on your database (e.g., "edvizdb")
   - Select "Query Tool" from the context menu
   - In the Query Tool window that opens, paste the SQL code in src/migrations/create_graphs_table.sql   
   
   - Click the "Execute" button (or press F5) to run the query
   - You should see a success message in the "Messages" tab below the query window

## Usage

1. Start the server:
```bash
python src/main.py
```

2. The server will be available at `http://localhost:8000`

3. API Endpoints:
   - `GET /health`: Health check endpoint
   - `POST /graphs`: Create a new graph
   - `GET /graphs`: Get recent graphs (with optional limit and offset parameters)
   - `GET /graphs/{graph_id}`: Get a specific graph by ID
   - `GET /graphs/search`: Search graphs by title and summary text
   - `POST /upload-pdf`: Upload and process a PDF file
   - `GET /get-svg/{file_id}`: Retrieve the generated SVG graph (for Mermaid graphs only)
   - `POST /api/contact`: Submit a contact form (JSON: name, email, subject, message)
   - `POST /render-graph`: Render a Mermaid SVG from a graph JSON (returns svg_content)

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for the interactive API documentation.

### Upload PDF Endpoint

The `/upload-pdf` endpoint accepts:
- `file`: PDF file to process
- `graph_type`: Type of graph to generate ("mermaid" or "force", defaults to "mermaid")

Response format:
```json
{
    "message": "File processed successfully",
    "file_id": "unique_id",
    "graph_json": {
        "nodes": [
            {
                "id": "string",
                "name": "string",
                "group": 1
            }
        ],
        "links": [
            {
                "source": "string",
                "target": "string",
                "type": "string",
                "description": "string"
            }
        ]
    },
    "svg_content": "string"  // Only included for Mermaid graphs
}
```

### Contact Form Endpoint

The `/api/contact` endpoint handles contact form submissions:

```json
POST /api/contact
{
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
}
```

Response format:
```json
{
    "message": "Thank you for your message. We'll get back to you soon!",
    "status": "success"
}
```

Error response:
```json
{
    "detail": "Failed to send message. Please try again later."
}
```

### Render Graph Endpoint

The `/render-graph` endpoint renders a Mermaid SVG from a graph JSON structure (no file upload required).

**Request:**
```json
POST /render-graph
{
  "graph_json": {
    "nodes": [
      { "id": "A", "name": "Node A" },
      { "id": "B", "name": "Node B" }
    ],
    "links": [
      { "source": "A", "target": "B", "type": "connects" }
    ]
  }
}
```

**Response:**
```json
{
  "svg_content": "<svg>...</svg>"
}
```

- The SVG rendering logic is identical to `/upload-pdf` for Mermaid graphs.
- This endpoint is ideal for live graph editing and instant SVG preview/download in the frontend.

## Graph Types

### Mermaid Graph
- Generates an SVG visualization
- Uses Mermaid syntax for graph representation
- Includes SVG content in the response
- Best for static, hierarchical visualizations

### Force-directed Graph
- Returns graph data in D3.js compatible format
- Includes node groups for coloring
- Includes link descriptions for tooltips
- Best for interactive, dynamic visualizations

## Rate Limiting

The API implements rate limiting to ensure proper usage:
- Health check: 5 requests per minute
- PDF upload: 10 requests per minute
- SVG retrieval: 30 requests per minute

## Error Handling

The server includes comprehensive error handling and logging:
- All errors are logged to `app.log`
- API errors return appropriate HTTP status codes and error messages
- File processing errors are caught and reported

## Directory Structure
```
concept-back/
├── src/
│   ├── __pycache__/                # Python bytecode cache
│   ├── migrations/                 # Database migration scripts
│   │   └── add_search_vector.sql   # Migration for search vector
│   │   └── create_graphs_table.sql # Creation of graph Table
│   ├── ai_processor.py             # AI integration module
│   ├── config.py                   # Configuration settings
│   ├── database.py                 # Database connection and session
│   ├── graph_generator.py          # Graph generation module
│   ├── main.py                     # FastAPI application
│   ├── models.py                   # Database models
│   └── pdf_processor.py            # PDF processing module
├── uploads/                        # Temporary PDF storage
├── output/                         # Generated SVG files
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.