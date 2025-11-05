"""
Main FastAPI application for AWE Electronics Online Store
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base


# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="AWE Electronics Online Store API",
    description="Backend API for AWE Electronics e-commerce platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers import (
    auth,
    products,
    cart,
    checkout,
    orders,
    admin_products,
    admin_orders,
    reports,
    tracking,
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["Checkout"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Order Tracking"])
app.include_router(
    admin_products.router, prefix="/api/admin/products", tags=["Admin - Products"]
)
app.include_router(
    admin_orders.router, prefix="/api/admin/orders", tags=["Admin - Orders"]
)
app.include_router(reports.router, prefix="/api/admin/reports", tags=["Reports"])


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to AWE Electronics Online Store API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
