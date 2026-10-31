"""
ReguloMe — Core Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ReguloMe"
    APP_VERSION: str = "0.1.0-alpha"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Auth / JWT
    SECRET_KEY: str = "regulome-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database (future)
    DATABASE_URL: Optional[str] = None
    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None

    # Pipeline
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 500
    NCBI_API_KEY: Optional[str] = None
    MAX_VARIANTS: int = 100


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
