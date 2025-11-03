from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import random
import string

from app.database.models import (
    Customer,
    ShoppingCart,
    Order,
    OrderItem,
    Invoice,
    DeliveryAddress,
    OrderStatus,
    ShippingMethod,
)
from app.services.shopping_cart_manager import ShoppingCartManager
from app.services.inventory_manager import InventoryManager


class OrderProcessor:
    """Orchestrates order fulfillment workflow"""

    @staticmethod
    def generate_order_number() -> str:
        """Generate unique order number"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_part = "".join(random.choices(string.digits, k=6))
        return f"AWE{timestamp}{random_part}"

    @staticmethod
    def create_order_from_cart(
        db: Session,
        cart: ShoppingCart,
        delivery_address: DeliveryAddress,
        shipping_method: ShippingMethod,
        customer: Customer,
    ) -> Order:
        """Create order from shopping cart"""
        if not cart.items:
            raise ValueError("Cart is empty")

        # Calculate totals
        totals = ShoppingCartManager.calculate_cart_totals(db, cart)

        # Adjust shipping based on method
        shipping_cost = totals["shipping"]
        if shipping_method == ShippingMethod.EXPRESS:
            shipping_cost += 10.0  # Express surcharge

        total_amount = totals["subtotal"] + totals["tax"] + shipping_cost

        # Create order
        order = Order(
            order_number=OrderProcessor.generate_order_number(),
            customer_id=customer.id,
            delivery_address_id=delivery_address.id,
            status=OrderStatus.PENDING_PAYMENT,
            shipping_method=shipping_method,
            subtotal=totals["subtotal"],
            shipping_cost=shipping_cost,
            tax_amount=totals["tax"],
            total_amount=total_amount,
            estimated_delivery=datetime.now()
            + timedelta(days=7 if shipping_method == ShippingMethod.STANDARD else 3),
        )
        db.add(order)
        db.flush()

        # Create order items and reserve stock
        for cart_item in cart.items:
            # Reserve stock
            if not InventoryManager.reserve_stock(
                db, cart_item.product_id, cart_item.quantity
            ):
                db.rollback()
                raise ValueError(f"Insufficient stock for {cart_item.product.name}")

            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                quantity=cart_item.quantity,
                line_total=cart_item.product.price * cart_item.quantity,
            )
            db.add(order_item)

        # Generate invoice
        invoice = Invoice(
            order_id=order.id,
            invoice_number=f"INV{order.order_number}",
            issued_at=datetime.now(),
        )
        db.add(invoice)

        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def update_order_status(db: Session, order_id: int, new_status: OrderStatus):
        """Update order status"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = new_status

            # Update timestamps based on status
            if new_status == OrderStatus.PAID:
                order.paid_at = datetime.now()
            elif new_status == OrderStatus.SHIPPED:
                order.shipped_at = datetime.now()
            elif new_status == OrderStatus.DELIVERED:
                order.delivered_at = datetime.now()

            db.commit()

    @staticmethod
    def cancel_order(db: Session, order_id: int):
        """Cancel order and release reserved stock"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return

        # Release reserved stock
        for item in order.items:
            InventoryManager.release_stock(db, item.product_id, item.quantity)

        order.status = OrderStatus.CANCELLED
        db.commit()

    @staticmethod
    def get_pending_orders(db: Session) -> List[Order]:
        """Get orders pending fulfillment"""
        return (
            db.query(Order)
            .filter(Order.status.in_([OrderStatus.PAID, OrderStatus.PROCESSING]))
            .order_by(Order.paid_at)
            .all()
        )
