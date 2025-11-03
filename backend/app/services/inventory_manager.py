from sqlalchemy.orm import Session
from typing import List

from app.database.models import (
    Product
)


class InventoryManager:
    """Controls product stock levels and availability"""
    
    @staticmethod
    def check_availability(db: Session, product_id: int, quantity: int) -> bool:
        """Check if sufficient stock is available"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        return product.available_quantity >= quantity
    
    @staticmethod
    def reserve_stock(db: Session, product_id: int, quantity: int) -> bool:
        """Reserve stock for order (atomic operation)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or product.available_quantity < quantity:
            return False
        
        product.reserved_quantity += quantity
        db.commit()
        return True
    
    @staticmethod
    def release_stock(db: Session, product_id: int, quantity: int):
        """Release reserved stock (e.g., after payment failure)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.reserved_quantity = max(0, product.reserved_quantity - quantity)
            db.commit()
    
    @staticmethod
    def confirm_sale(db: Session, product_id: int, quantity: int):
        """Confirm sale and reduce actual stock"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.stock_quantity -= quantity
            product.reserved_quantity = max(0, product.reserved_quantity - quantity)
            db.commit()
    
    @staticmethod
    def get_low_stock_products(db: Session) -> List[Product]:
        """Get products with low stock"""
        return db.query(Product).filter(
            (Product.stock_quantity - Product.reserved_quantity) <= Product.low_stock_threshold,
            Product.is_active == True
        ).all()