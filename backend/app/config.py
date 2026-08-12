import os

class Settings:
    PROJECT_NAME: str = "ErythroNet API"
    PROJECT_VERSION: str = "1.0.0"
    
    # SQLite Database connection URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./erythronet.db")
    
    # Folder to store doctor prescriptions/hospital slips uploaded by users
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR", 
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    )
    
    # Base URL for accessing uploaded slips via http
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

settings = Settings()
