import os
from pathlib import Path
from typing import Dict, Any
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class Config:
    def __init__(self):
        # Get the project root directory (2 levels up from this file)
        self.root_dir = Path(__file__).parent.parent
        
        # Define all important directories
        self.src_dir = self.root_dir / "src"
        self.output_dir = self.root_dir / "output"
        self.uploads_dir = self.root_dir / "uploads"
        
        # Define all important files
        self.env_file = self.root_dir / ".env"
        self.graph_json_file = self.root_dir / "graph_representations.json"
        self.log_file = self.root_dir / "app.log"
        
        # Create necessary directories
        self._create_directories()
        
        # Load environment variables
        self._load_env()
        
        # Store environment variables
        self.env_vars: Dict[str, Any] = {}

    def _create_directories(self) -> None:
        """Create necessary directories if they don't exist"""
        directories = [self.output_dir, self.uploads_dir]
        for directory in directories:
            directory.mkdir(exist_ok=True)
            logger.info(f"Ensured directory exists: {directory}")

    def _load_env(self) -> None:
        """Load environment variables from .env file"""
        try:
            if self.env_file.exists():
                load_dotenv(self.env_file)
                logger.info(f"Loaded environment variables from {self.env_file}")
            else:
                logger.warning(f"Environment file not found at {self.env_file}")
        except Exception as e:
            logger.error(f"Error loading environment variables: {str(e)}")
            raise

    def get_env_var(self, key: str, default: Any = None) -> Any:
        """Get environment variable with optional default value"""
        value = os.getenv(key, default)
        self.env_vars[key] = value
        return value

    def get_file_path(self, file_type: str) -> Path:
        """Get the path for a specific file type"""
        file_paths = {
            "graph_json": self.graph_json_file,
            "env": self.env_file,
            "log": self.log_file
        }
        
        if file_type not in file_paths:
            raise ValueError(f"Unknown file type: {file_type}")
            
        return file_paths[file_type]

    def ensure_file_exists(self, file_type: str) -> bool:
        """Check if a specific file exists"""
        file_path = self.get_file_path(file_type)
        exists = file_path.exists()
        if not exists:
            logger.warning(f"File not found: {file_path}")
        return exists

# Create a global config instance
config = Config() 