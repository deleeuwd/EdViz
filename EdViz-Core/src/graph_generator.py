import json
import subprocess
from pathlib import Path
import os
from typing import Dict, Any, Optional

class GraphGenerator:
    def __init__(self):
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
        self.graph_data: Optional[Dict[str, Any]] = None

    def _convert_to_mermaid(self, graph_json: Dict[str, Any]) -> str:
        """Convert graph JSON to Mermaid format"""
        mermaid_lines = ["graph TD"]
        
        # Add nodes with sanitized IDs
        for node in graph_json["nodes"]:
            node_id = node["id"].replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")
            node_name = node["name"]
            mermaid_lines.append(f'    {node_id}["{node_name}"]')
        
        # Add edges using sanitized IDs
        for edge in graph_json["links"]:
            source = edge["source"].replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")
            target = edge["target"].replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "")
            edge_type = edge["type"]
            mermaid_lines.append(f'    {source} -->|{edge_type}| {target}')
        
        return "\n".join(mermaid_lines)

    def generate_svg(self, graph_json: Dict[str, Any], filename: str = "graph") -> Path:
        """Generate SVG file from graph data using Mermaid CLI"""
        try:
            # Convert JSON to Mermaid format
            mermaid_content = self._convert_to_mermaid(graph_json)
            
            # Save Mermaid content to a file
            mermaid_file = self.output_dir / f"{filename}.mmd"
            with open(mermaid_file, "w", encoding="utf-8") as f:
                f.write(mermaid_content)
            
            # Get the username from environment
            username = os.getenv('USERNAME')
            mmdc_path = fr'C:\Users\{username}\AppData\Roaming\npm\mmdc.cmd'
            
            if not os.path.exists(mmdc_path):
                print("Error: Mermaid CLI not found. Please install it using:")
                print("npm install -g @mermaid-js/mermaid-cli")
                return None
            
            # Generate SVG using Mermaid CLI with full path
            svg_file = self.output_dir / f"{filename}.svg"
            subprocess.run(
                [mmdc_path, "-i", str(mermaid_file), "-o", str(svg_file)],
                check=True,
                capture_output=True,
                text=True
            )
            
            print(f"Graph successfully generated and saved as '{svg_file}'!")
            return svg_file
            
        except subprocess.CalledProcessError as e:
            print(f"Error running Mermaid CLI: {e.stderr}")
            raise
        except Exception as e:
            print(f"Error generating SVG: {str(e)}")
            raise

def main():
    """Main function to demonstrate usage"""
    try:
        # Sample graph data
        sample_data = {
            "nodes": [
                {"id": "node1", "label": "First Node"},
                {"id": "node2", "label": "Second Node"},
                {"id": "node3", "label": "Third Node"}
            ],
            "edges": [
                {"source": "node1", "target": "node2", "label": "connects to"},
                {"source": "node2", "target": "node3", "label": "leads to"}
            ]
        }
        
        # Initialize the generator
        generator = GraphGenerator()
        
        # Generate SVG
        svg_path = generator.generate_svg(sample_data)
        if svg_path:
            print(f"Graph successfully generated and saved as '{svg_path}'!")
        
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    main() 