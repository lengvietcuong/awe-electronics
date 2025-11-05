from sqlalchemy.orm import Session
from typing import Optional

from app.database.models import Product
from app.api_schemas import ProductCreate, ProductUpdate


class ProductManager:
    """Handles product information lifecycle (CRUD operations)"""

    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create new product"""
        product = Product(**product_data.dict())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(
        db: Session, product_id: int, product_data: ProductUpdate
    ) -> Optional[Product]:
        """Update product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None

        update_data = product_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def discontinue_product(db: Session, product_id: int) -> bool:
        """Mark product as discontinued"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False

        product.is_discontinued = True
        product.is_active = False
        db.commit()
        return True

    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """Delete product (use with caution)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False

        db.delete(product)
        db.commit()
        return True

    @staticmethod
    def adjust_stock(db: Session, product_id: int, delta: int) -> Product:
        """Adjust stock levels by delta (positive or negative)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        new_quantity = product.stock_quantity + delta
        if new_quantity < 0:
            raise ValueError("Stock level cannot be negative")

        if new_quantity < product.reserved_quantity:
            raise ValueError(
                "Cannot reduce stock below reserved quantity for active orders"
            )

        product.stock_quantity = new_quantity
        db.commit()
        db.refresh(product)
        return product
