"""
Vercel entry point for AWE Electronics FastAPI application
"""

from app.main import app

# Vercel will look for an 'app' variable in this file
__all__ = ["app"]
