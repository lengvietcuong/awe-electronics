"""
Products router - Browse product catalogue
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.database.database import get_db
from app.api_schemas import ProductResponse, ProductListResponse
from app.services import ProductCatalogue

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Browse products with filtering, search, and pagination

    - **category**: Filter by product category
    - **search**: Search in product name, description, brand, model
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **page**: Page number (starts at 1)
    - **page_size**: Items per page (max 100)
    """
    products, total = ProductCatalogue.get_products(
        db, category, search, min_price, max_price, page, page_size
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """
    Get all product categories
    """
    categories = ProductCatalogue.get_categories(db)
    return {"categories": categories}


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get detailed product information by ID
    """
    product = ProductCatalogue.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
