from sqlalchemy.orm import Session
from typing import Optional

from app.database.models import (
    ShoppingCart,
    CartItem,
)
from app.services.inventory_manager import InventoryManager


class ShoppingCartManager:
    """Handles shopping cart operations"""

    @staticmethod
    def get_or_create_cart(
        db: Session, customer_id: Optional[int] = None, session_id: Optional[str] = None
    ) -> ShoppingCart:
        """Get existing cart or create new one"""
        if customer_id:
            cart = (
                db.query(ShoppingCart)
                .filter(ShoppingCart.customer_id == customer_id)
                .first()
            )
        elif session_id:
            cart = (
                db.query(ShoppingCart)
                .filter(ShoppingCart.session_id == session_id)
                .first()
            )
        else:
            cart = None

        if not cart:
            cart = ShoppingCart(customer_id=customer_id, session_id=session_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)

        return cart

    @staticmethod
    def add_item(db: Session, cart_id: int, product_id: int, quantity: int) -> CartItem:
        """Add or update item in cart"""
        # Check product availability
        if not InventoryManager.check_availability(db, product_id, quantity):
            raise ValueError("Insufficient stock")

        # Check if item already in cart
        cart_item = (
            db.query(CartItem)
            .filter(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
            .first()
        )

        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart_id, product_id=product_id, quantity=quantity
            )
            db.add(cart_item)

        db.commit()
        db.refresh(cart_item)
        return cart_item

    @staticmethod
    def update_item(
        db: Session, cart_item_id: int, quantity: int
    ) -> Optional[CartItem]:
        """Update cart item quantity or remove if 0"""
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if not cart_item:
            return None

        if quantity == 0:
            db.delete(cart_item)
            db.commit()
            return None

        # Check availability for new quantity
        if not InventoryManager.check_availability(db, cart_item.product_id, quantity):
            raise ValueError("Insufficient stock")

        cart_item.quantity = quantity
        db.commit()
        db.refresh(cart_item)
        return cart_item

    @staticmethod
    def remove_item(db: Session, cart_item_id: int):
        """Remove item from cart"""
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if cart_item:
            db.delete(cart_item)
            db.commit()

    @staticmethod
    def get_cart_with_items(db: Session, cart_id: int) -> Optional[ShoppingCart]:
        """Get cart with all items"""
        return db.query(ShoppingCart).filter(ShoppingCart.id == cart_id).first()

    @staticmethod
    def calculate_cart_totals(db: Session, cart: ShoppingCart) -> dict:
        """Calculate cart subtotal, tax, shipping, and total"""
        subtotal = 0.0
        for item in cart.items:
            subtotal += item.product.price * item.quantity

        # Calculate GST (10% in Australia)
        tax = subtotal * 0.1

        # Calculate shipping (simple logic)
        shipping = 0.0
        if subtotal < 100:
            shipping = 15.0  # Flat rate for orders under $100

        total = subtotal + tax + shipping

        return {
            "subtotal": round(subtotal, 2),
            "tax": round(tax, 2),
            "shipping": round(shipping, 2),
            "total": round(total, 2),
        }

    @staticmethod
    def clear_cart(db: Session, cart_id: int):
        """Clear all items from cart"""
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        db.commit()