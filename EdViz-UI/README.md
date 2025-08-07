# Ed-Viz

A modern web application for converting PDF documents into interactive concept maps with multiple visualization options.

## Features

- PDF to interactive concept map conversion
- Multiple visualization types:
  - Force Graph: Interactive, physics-based visualization
  - Mermaid: Static, hierarchical diagram
- High-quality output
- Maintains document structure
- Scalable vector graphics
- Web-friendly format
- Modern, responsive UI
- Dark mode support
- Previous works history

## Tech Stack

- **React** (v18.2.0) - Frontend library
- **TypeScript** (v4.9.5) - Type safety and better developer experience
- **Material-UI** (v5.15.6) - UI component library
  - @mui/material
  - @mui/icons-material
  - @mui/lab
  - @emotion/react
  - @emotion/styled
- **React Router** (v6.21.3) - Navigation and routing
- **React Dropzone** (v14.2.3) - File upload functionality
- **Axios** (v1.6.7) - HTTP client
- **Framer Motion** (v10.16.4) - Smooth animations and transitions
- **React Force Graph** (v1.27.1) - Interactive force-directed graph visualization

### Development Dependencies
- **cross-env** (v7.0.3) - Cross-platform environment variable handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- A modern web browser (Chrome, Firefox, Edge, etc.)
- Backend server running (see Backend Setup section)

### Environment Setup

1. Create a `.env` file in the root directory with the following content:
```
REACT_APP_API_URL=http://localhost:8000
```
Note: Adjust the URL if your backend runs on a different port.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the project directory:
```bash
cd Ed-VizUI
```

3. Install all dependencies (including dev dependencies):
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Integration

### Request Format
```json
POST /upload-pdf
Content-Type: multipart/form-data

{
  "file": [PDF_FILE],
  "graph_type": "force" | "mermaid"
}
```

### Response Format

#### Force Graph Response
```json
{
  "message": "Success",
  "file_id": "unique_file_id",
  "graph_json": {
    "nodes": [
      {
        "id": "1",
        "name": "Node A",
        "group": 1  // 1 for red, other values for blue
      }
    ],
    "links": [
      {
        "source": "1",
        "target": "2",
        "type": "relates_to",
        "description": "Connection description"
      }
    ]
  }
}
```

#### Mermaid Response
```json
{
  "message": "Success",
  "file_id": "unique_file_id",
  "graph_json": {
    "nodes": [
      {
        "id": "1",
        "name": "Node A",
        "type": "concept"
      }
    ],
    "links": [
      {
        "source": "1",
        "target": "2",
        "type": "relates_to",
        "description": "Connection description"
      }
    ]
  },
  "svg_content": "<svg>...</svg>"  // Mermaid-generated SVG
}
```

### Visualization Types

#### Force Graph
- Interactive, physics-based visualization
- Nodes can be dragged and rearranged
- Supports node grouping and coloring
- Dynamic link visualization with directional particles
- Real-time interaction and animation

#### Mermaid
- Static, hierarchical diagram
- Clean and professional appearance
- Suitable for documentation
- SVG-based output
- Fixed layout

### Troubleshooting

If you encounter any issues:

1. Clear npm cache and reinstall dependencies:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

2. Make sure all required environment variables are set in your `.env` file
3. Ensure the backend server is running and accessible
4. Check your Node.js version matches the requirements

## Project Structure

```
src/
├── components/
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   ├── common/         # Shared components (SVGPreview, NetworkBackground, etc.)
│   └── graph/          # Graph editor components (GraphEditor)
├── pages/
│   ├── Home/          # Home page components (UploadSection, SvgDisplay, etc.)
│   ├── Settings/      # Settings page
│   ├── Contact/       # Contact page
│   └── PreviousWorks/ # Previous works page
├── services/          # API services (api.ts)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── context/          # React context providers
├── assets/           # Static assets (images, icons, etc.)
├── App.tsx           # Main application component
├── AppContent.tsx    # Application content wrapper
├── index.tsx         # Application entry point
└── index.css         # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
