from sqlmodel import SQLModel, Field
from typing import Optional, Dict
from datetime import datetime
import uuid
from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import JSONB

class Graph(SQLModel, table=True):
    __tablename__ = "graphs"  # Explicitly set the table name to 'graphs'
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    summary_text: Optional[str] = None
    graph_data: Dict = Field(default={}, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    search_vector: Optional[str] = Field(default=None, sa_column=Column("search_vector", Text))
