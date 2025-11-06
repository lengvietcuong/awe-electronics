"""Admin Products router - Product management (staff/manager only)"""

import math
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api_schemas import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductStockAdjustment,
    ProductUpdate,
)
from app.database.database import get_db
from app.database.models import Account
from app.services import InventoryManager, ProductManager
from app.utils.security import get_current_manager, get_current_staff

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def list_products(
    search: Optional[str] = Query(
        None, description="Search by name, description, brand, or model number"
    ),
    category: Optional[str] = Query(None, min_length=1, max_length=100),
    status: Optional[Literal["active", "inactive"]] = Query(
        None, description="Filter by lifecycle status"
    ),
    availability: Optional[Literal["in_stock", "out_of_stock", "low_stock"]] = Query(
        None, description="Filter by stock availability"
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    sort_by: Literal[
        "created_at",
        "updated_at",
        "name",
        "price",
        "stock",
        "stock_quantity",
        "availability",
    ] = Query("created_at"),
    sort_direction: Literal["asc", "desc"] = Query("desc"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """List products for management with rich filtering and sorting."""

    products, total = ProductManager.list_products(
        db,
        search=search,
        category=category,
        status=status,
        availability=availability,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_direction=sort_direction,
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Create new product (staff/manager only)

    Adds a new product to the catalogue with initial stock quantity.
    """
    product = ProductManager.create_product(db, product_data)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Update product details (staff/manager only)

    Updates product information including price, stock, and attributes.
    """
    try:
        product = ProductManager.update_product(db, product_id, product_data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.patch(
    "/{product_id}/stock",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
def adjust_stock_levels(
    product_id: int,
    adjustments: ProductStockAdjustment,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Adjust stock levels for a product (staff/manager only)

    Positive adjustments increase available stock. Negative adjustments reduce stock but
    cannot drop below zero or below reserved quantity for open orders.
    """
    try:
        product = ProductManager.adjust_stock(db, product_id, adjustments.delta)
        return product
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/low-stock", response_model=list[ProductResponse])
def list_low_stock_products(
    threshold: int | None = None,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """List products at or below the low stock threshold (staff/manager only)."""
    products = InventoryManager.get_low_stock_products(db, custom_threshold=threshold)
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """Retrieve a single product, including inactive or discontinued items."""

    product = ProductManager.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Delete product permanently (manager only - use with caution)

    WARNING: This permanently deletes the product from the database.
    Consider using discontinue instead to maintain order history.
    """
    success = ProductManager.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")

    return None
