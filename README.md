# EdViz — PDF ➜ Knowledge Graphs

> Convert study PDFs into interactive concept maps. Full‑stack app built with **FastAPI (Python)** and **React (TypeScript + MUI)**. Extracts concepts/relations via **DeepSeek (LLM)** and renders either **Force‑directed JSON** or **Mermaid SVG**.

---

## ✨ Features

* **PDF ➜ Graph**: Extracts entities, relations and hierarchy from PDFs
* **Two visual styles**: Force‑directed (interactive) • Mermaid (static SVG)
* **LLM‑powered**: DeepSeek for semantic parsing (OpenAI‑compatible)
* **DB support (Postgres)**: Optional persistence, search, history
* **Robust API**: Rate‑limiting, logging, error handling, health checks
* **Modern UI**: Responsive, dark mode, previous works history

---

## 🏗️ Architecture (Frontend → Backend)

```mermaid
flowchart LR
  U[User / Browser] --> F[React + TS + MUI]
  F -->|HTTP (axios)| B[FastAPI]
  B --> P[PDF Processor]
  P --> L[DeepSeek AI]
  L --> G[Graph Generator]
  G -->|Mermaid SVG| V[Viewer]
  G -->|Force JSON| V
  G --> H[(PostgreSQL)]
```

**Flow:** The **frontend always calls the backend**. Backend parses the PDF, invokes the LLM, builds a graph, stores/returns JSON/Mermaid; UI renders it.

---

## 🧰 Tech Stack

**Frontend:** React 18, TypeScript, MUI 5, React Router, React Dropzone, Axios, Framer Motion, React‑Force‑Graph
**Backend:** Python 3.11+, FastAPI, Uvicorn, pydantic
**LLM:** DeepSeek (or any OpenAI‑compatible provider)
**DB:** PostgreSQL (SQLAlchemy)
**CLI (optional):** Mermaid CLI for local SVG rendering

---

## 🗂️ Monorepo Layout

```
EdViz/
  backend/                 # FastAPI API server
    src/
      migrations/          # SQL migrations (tables, search vector)
      ai_processor.py
      pdf_processor.py
      graph_generator.py
      database.py
      models.py
      config.py
      main.py              # FastAPI app entry
    requirements.txt
    .env.example
  frontend/                # React app (MUI, TS)
    src/
      components/
      pages/
      services/
      types/
      utils/
      context/
    package.json
  README.md                # This file
```

---

## 🚀 Quickstart (Local Dev)

> Order matters: **start Backend first**, then Frontend.

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # fill in keys (see below)
uvicorn src.main:app --reload --port 8000
```

Backend available at **[http://localhost:8000](http://localhost:8000)** (docs: **/docs**)

#### Backend .env (minimal)

```env
# LLM
DEEPSEEK_API_KEY=your_key_here   # or OPENAI_API_KEY=...
MODEL_NAME=deepseek-chat         # compatible model name

# CORS / server
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_ORIGIN=http://localhost:3000

# Postgres (optional persistence)
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edviz
```

### (Optional) Database Setup

* Install PostgreSQL and pgAdmin
* Create DB `edviz`
* Run SQL from `src/migrations/create_graphs_table.sql` (and other migrations)

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at **[http://localhost:3000](http://localhost:3000)**. Ensure it points to the backend via env:

```
REACT_APP_API_URL=http://localhost:8000
```

---

## 📦 API Reference (summary)

Once running, see full interactive docs at **/docs**.

**Health & Meta**

* `GET /health` → service health

**Graphs**

* `POST /upload-pdf` → Upload a PDF and generate a graph

  * multipart: `file` (PDF), `graph_type` = `mermaid` | `force` (default: `mermaid`)
  * returns: `graph_json`, optional `svg_content` (Mermaid)
* `POST /render-graph` → Render Mermaid SVG from provided JSON (no file upload)
* `POST /graphs` → Persist a graph JSON with optional metadata
* `GET /graphs` → Recent graphs (query: `limit`, `offset`)
* `GET /graphs/{graph_id}` → Fetch a graph by ID
* `GET /graphs/search` → Search by title/summary
* `GET /get-svg/{file_id}` → Retrieve generated SVG by ID (Mermaid only)

**Contact**

* `POST /api/contact` → `{ name, email, subject, message }`

### Response Shapes (examples)

**Force Graph**

```json
{
  "message": "Success",
  "file_id": "unique_file_id",
  "graph_json": {
    "nodes": [ { "id": "1", "name": "Node A", "group": 1 } ],
    "links": [ { "source": "1", "target": "2", "type": "relates_to", "description": "..." } ]
  }
}
```

**Mermaid**

```json
{
  "message": "Success",
  "file_id": "unique_file_id",
  "graph_json": {
    "nodes": [ { "id": "1", "name": "Node A", "type": "concept" } ],
    "links": [ { "source": "1", "target": "2", "type": "relates_to", "description": "..." } ]
  },
  "svg_content": "<svg>...</svg>"
}
```

---

## 🧭 Graph Types

**Mermaid**

* Static SVG, clean hierarchical documentation, identical render via `/upload-pdf` and `/render-graph`

**Force‑directed**

* Interactive D3‑compatible JSON (drag, physics), node groups, link descriptions

---

## 🔒 Rate Limiting & 🧰 Error Handling

* Health check: **5 req/min**
* PDF upload: **10 req/min**
* SVG retrieval: **30 req/min**
* All errors logged to `app.log`; API returns proper status codes/messages

---

## 🧪 Development

* Backend tests: `pytest`
* Frontend tests: `npm test`

---

## 🛠️ Troubleshooting

* Frontend issues: clear cache, reinstall deps

  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```
* Verify env vars (`REACT_APP_API_URL`, API keys)
* Ensure backend is running and accessible before starting frontend
* Node version matches required

---

## 🗺️ Roadmap

* Export PNG/SVG from UI
* In‑graph search/filter
* Multi‑PDF merge & cross‑links
* Styling presets per node/edge type

---

## 🤝 Contributing

1. Fork → 2) Feature branch → 3) Commit → 4) Push → 5) PR

---

## 🪪 License

MIT
