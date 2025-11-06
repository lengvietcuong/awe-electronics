from typing import List, Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.models import Product, CartItem
from app.api_schemas import ProductCreate, ProductUpdate


class ProductManager:
    """Handles product information lifecycle (CRUD operations)"""

    @staticmethod
    def list_products(
        db: Session,
        *,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        availability: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_direction: str = "desc",
    ) -> Tuple[List[Product], int]:
        """Return paginated list of products for administrative management."""

        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)

        query = db.query(Product)

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(pattern),
                    Product.description.ilike(pattern),
                    Product.brand.ilike(pattern),
                    Product.model_number.ilike(pattern),
                )
            )

        if category:
            query = query.filter(Product.category == category)

        if status:
            normalized_status = status.lower()
            if normalized_status == "active":
                query = query.filter(Product.is_active.is_(True))
            elif normalized_status == "inactive":
                query = query.filter(Product.is_active.is_(False))

        if availability:
            normalized_availability = availability.lower()
            available_expr = Product.stock_quantity - Product.reserved_quantity
            if normalized_availability == "in_stock":
                query = query.filter(available_expr > 0)
            elif normalized_availability == "out_of_stock":
                query = query.filter(available_expr <= 0)
            elif normalized_availability == "low_stock":
                query = query.filter(available_expr <= Product.low_stock_threshold)

        total = query.count()

        sort_key = (sort_by or "created_at").lower()
        sort_direction = (sort_direction or "desc").lower()
        sort_map = {
            "name": Product.name,
            "price": Product.price,
            "stock": Product.stock_quantity,
            "stock_quantity": Product.stock_quantity,
            "created_at": Product.created_at,
            "updated_at": Product.updated_at,
            "availability": Product.stock_quantity - Product.reserved_quantity,
        }
        sort_column = sort_map.get(sort_key, Product.created_at)

        if sort_direction == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        offset = (page - 1) * page_size
        products = query.offset(offset).limit(page_size).all()

        return products, total

    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Fetch a single product regardless of active status."""
        return db.query(Product).filter(Product.id == product_id).first()

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

        if "stock_quantity" in update_data:
            new_stock = update_data["stock_quantity"]
            if new_stock < product.reserved_quantity:
                raise ValueError(
                    "Stock quantity cannot be less than reserved quantity for active orders"
                )

        # Ignore deprecated flags if provided inadvertently
        update_data.pop("is_discontinued", None)

        if update_data.get("is_active") is True:
            product.is_discontinued = False

        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """Delete product (use with caution)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False

        # Delete all cart items that reference this product
        db.query(CartItem).filter(CartItem.product_id == product_id).delete()

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
