from sqlalchemy.orm import Session
from typing import Tuple
from datetime import datetime
import random

from app.database.models import (
    Order,
    Payment,
    Receipt,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
)
from app.services.inventory_manager import InventoryManager


class PaymentProcessor:
    """Coordinates payment processing across multiple payment methods"""

    @staticmethod
    def generate_receipt_number() -> str:
        """Generate unique receipt number"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"REC{timestamp}"

    @staticmethod
    def process_payment(
        db: Session, order: Order, payment_method: PaymentMethod, payment_details: dict
    ) -> Tuple[Payment, bool]:
        """Process payment (mock implementation for hackathon)"""
        # Create payment record
        payment = Payment(
            order_id=order.id,
            payment_method=payment_method,
            payment_status=PaymentStatus.PENDING,
            amount=order.total_amount,
        )
        db.add(payment)
        db.flush()

        # Mock payment processing
        success = PaymentProcessor._process_payment_strategy(
            payment_method, payment_details
        )

        if success:
            payment.payment_status = PaymentStatus.COMPLETED
            payment.completed_at = datetime.now()
            payment.transaction_id = f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

            # Store masked payment details
            if (
                payment_method == PaymentMethod.CREDIT_CARD
                and "card_number" in payment_details
            ):
                payment.card_last_four = payment_details["card_number"][-4:]
            elif (
                payment_method == PaymentMethod.PAYPAL
                and "paypal_email" in payment_details
            ):
                payment.payment_email = payment_details["paypal_email"]

            # Update order status
            order.status = OrderStatus.PAID
            order.paid_at = datetime.now()

            # Generate receipt
            receipt = Receipt(
                payment_id=payment.id,
                receipt_number=PaymentProcessor.generate_receipt_number(),
                issued_at=datetime.now(),
            )
            db.add(receipt)

            db.commit()
            return payment, True
        else:
            payment.payment_status = PaymentStatus.FAILED
            payment.failed_at = datetime.now()
            payment.failure_reason = "Payment declined (mock failure)"
            order.status = OrderStatus.PAYMENT_FAILED

            # Release reserved stock
            for item in order.items:
                InventoryManager.release_stock(db, item.product_id, item.quantity)

            db.commit()
            return payment, False

    @staticmethod
    def _process_payment_strategy(
        payment_method: PaymentMethod, payment_details: dict
    ) -> bool:
        """
        Mock payment processing strategy
        In real implementation, this would call appropriate payment gateway
        For hackathon: 90% success rate
        """
        # Simulate payment processing
        return random.random() > 0.1  # 90% success rate
