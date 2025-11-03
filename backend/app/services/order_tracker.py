from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime

from app.database.models import (
    Order,
    OrderStatus,
)


class OrderTracker:
    """Provides order status tracking and delivery information"""

    @staticmethod
    def get_order_by_number(
        db: Session, order_number: str, email: str
    ) -> Optional[Order]:
        """Get order by order number and verify customer email"""
        order = db.query(Order).filter(Order.order_number == order_number).first()
        if not order:
            return None

        # Verify email matches
        if order.customer.email.lower() != email.lower():
            return None

        return order

    @staticmethod
    def get_order_status_history(order: Order) -> List[Dict]:
        """Get status history for order"""
        history = []

        if order.created_at:
            history.append(
                {
                    "status": "Order Confirmed",
                    "timestamp": order.created_at,
                    "description": "Your order has been confirmed",
                }
            )

        if order.paid_at:
            history.append(
                {
                    "status": "Payment Received",
                    "timestamp": order.paid_at,
                    "description": "Payment has been processed successfully",
                }
            )

        if order.status == OrderStatus.PROCESSING:
            history.append(
                {
                    "status": "Processing",
                    "timestamp": order.paid_at or order.created_at,
                    "description": "Your order is being prepared for shipment",
                }
            )

        if order.shipped_at:
            history.append(
                {
                    "status": "Shipped",
                    "timestamp": order.shipped_at,
                    "description": f"Your order has been shipped. Tracking: {order.tracking_number}",
                }
            )

        if order.status == OrderStatus.OUT_FOR_DELIVERY:
            history.append(
                {
                    "status": "Out for Delivery",
                    "timestamp": order.shipped_at or datetime.now(),
                    "description": "Your order is out for delivery",
                }
            )

        if order.delivered_at:
            history.append(
                {
                    "status": "Delivered",
                    "timestamp": order.delivered_at,
                    "description": "Your order has been delivered",
                }
            )

        if order.status == OrderStatus.CANCELLED:
            history.append(
                {
                    "status": "Cancelled",
                    "timestamp": order.created_at,
                    "description": "This order has been cancelled",
                }
            )

        return history

    @staticmethod
    def get_customer_orders(
        db: Session, customer_id: int, page: int = 1, page_size: int = 10
    ) -> tuple:
        """Get all orders for a customer"""
        query = (
            db.query(Order)
            .filter(Order.customer_id == customer_id)
            .order_by(Order.created_at.desc())
        )

        total = query.count()
        offset = (page - 1) * page_size
        orders = query.offset(offset).limit(page_size).all()

        return orders, total