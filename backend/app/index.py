"""
Vercel entry point for FastAPI
Vercel looks for 'app' variable in app/index.py
"""
from app.main import app

__all__ = ["app"]
