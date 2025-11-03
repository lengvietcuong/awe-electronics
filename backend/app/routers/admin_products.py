"""
Admin Products router - Product management (staff/manager only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api_schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services import ProductManager
from app.utils.security import get_current_staff
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


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
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
