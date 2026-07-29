import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LIB-MAN - College Library Management System"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB Settings (Default for MongoDB Compass local connection)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "libman_db")
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "libman_super_secret_jwt_key_2026_college_system")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Fine Settings
    FINE_PER_DAY: float = 2.0 # $2 or ₹2 per overdue day
    
    class Config:
        case_sensitive = True

settings = Settings()
