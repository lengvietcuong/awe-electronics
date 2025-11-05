"""
Configuration settings for AWE Electronics
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        # Allow environment variables to override .env file
        # This is important for Vercel deployment
        env_file_encoding = "utf-8"


settings = Settings()
