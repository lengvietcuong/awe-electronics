from sqlalchemy.orm import Session
from typing import Optional

from app.database.models import (
    Product, Order, NotificationLog
)


class NotificationService:
    """Centralized service for sending notifications (Observer pattern)"""
    
    @staticmethod
    def log_notification(db: Session, recipient_email: str, notification_type: str,
                        subject: str, success: bool = True, error_message: Optional[str] = None):
        """Log notification attempt"""
        log = NotificationLog(
            recipient_email=recipient_email,
            notification_type=notification_type,
            subject=subject,
            success=success,
            error_message=error_message
        )
        db.add(log)
        db.commit()
    
    @staticmethod
    def send_order_confirmation(db: Session, order: Order):
        """Send order confirmation email (mock implementation)"""
        subject = f"Order Confirmation - {order.order_number}"
        # In real implementation, would send email via EmailService
        NotificationService.log_notification(
            db,
            order.customer.email,
            "order_confirmation",
            subject
        )
    
    @staticmethod
    def send_payment_confirmation(db: Session, order: Order):
        """Send payment confirmation email"""
        subject = f"Payment Received - {order.order_number}"
        NotificationService.log_notification(
            db,
            order.customer.email,
            "payment_confirmation",
            subject
        )
    
    @staticmethod
    def send_shipment_notification(db: Session, order: Order):
        """Send shipment notification email"""
        subject = f"Your Order Has Been Shipped - {order.order_number}"
        NotificationService.log_notification(
            db,
            order.customer.email,
            "shipment_notification",
            subject
        )
    
    @staticmethod
    def send_delivery_notification(db: Session, order: Order):
        """Send delivery confirmation email"""
        subject = f"Your Order Has Been Delivered - {order.order_number}"
        NotificationService.log_notification(
            db,
            order.customer.email,
            "delivery_notification",
            subject
        )
    
    @staticmethod
    def send_low_stock_alert(db: Session, product: Product, recipient_email: str = "manager@aweelectronics.com"):
        """Send low stock alert to management"""
        subject = f"Low Stock Alert - {product.name}"
        NotificationService.log_notification(
            db,
            recipient_email,
            "low_stock_alert",
            subject
        )
