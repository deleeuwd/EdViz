from sqlmodel import create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
if not DB_USERNAME:
    raise ValueError("DB_USERNAME environment variable is not set")
if not DB_PASSWORD:
    raise ValueError("DB_PASSWORD environment variable is not set")
if not DB_HOST:
    raise ValueError("DB_HOST environment variable is not set")
if not DB_PORT:
    raise ValueError("DB_PORT environment variable is not set")
if not DB_NAME:
    raise ValueError("DB_NAME environment variable is not set")


DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
