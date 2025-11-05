"""
Admin Products router - Product management (staff/manager only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api_schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductStockAdjustment,
)
from app.services import ProductManager, InventoryManager
from app.utils.security import get_current_staff, get_current_manager
from app.database.models import Account, Product

router = APIRouter()


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
    product = ProductManager.update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.post(
    "/{product_id}/discontinue",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
def discontinue_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Mark product as discontinued (staff/manager only)

    Product will no longer be available for purchase but remains in system for order history.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    ProductManager.discontinue_product(db, product_id)
    db.refresh(product)

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
