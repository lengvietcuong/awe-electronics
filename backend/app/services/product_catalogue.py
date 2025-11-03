from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Tuple

from app.database.models import (
    Product,
)


class ProductCatalogue:
    """Manages product browsing, search, and filtering operations"""

    @staticmethod
    def get_products(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Product], int]:
        """Browse products with filtering and pagination"""
        query = db.query(Product).filter(
            Product.is_active == True, Product.is_discontinued == False
        )

        # Apply filters
        if category:
            query = query.filter(Product.category == category)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_pattern),
                    Product.description.ilike(search_pattern),
                    Product.brand.ilike(search_pattern),
                    Product.model_number.ilike(search_pattern),
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        products = query.offset(offset).limit(page_size).all()

        return products, total

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Get single product details"""
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_categories(db: Session) -> List[str]:
        """Get all product categories"""
        categories = db.query(Product.category).distinct().all()
        return [cat[0] for cat in categories]