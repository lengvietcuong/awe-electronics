from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
import string

from app.database.models import (
    Order,
    Shipment,
    OrderStatus,
)


class ShipmentManager:
    """Manages order fulfillment from packaging through shipment"""

    @staticmethod
    def generate_tracking_number() -> str:
        """Generate unique tracking number"""
        prefix = "AU"
        numbers = "".join(random.choices(string.digits, k=12))
        return f"{prefix}{numbers}"

    @staticmethod
    def create_shipment(
        db: Session,
        order_id: int,
        packing_notes: Optional[str] = None,
        *,
        tracking_number: Optional[str] = None,
        courier_name: Optional[str] = None,
    ) -> Shipment:
        """Create shipment for order"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")

        if order.status not in [OrderStatus.PAID, OrderStatus.PROCESSING]:
            raise ValueError("Order not ready for shipment")

        if order.shipment:
            raise ValueError("Shipment already exists for this order")

        # Generate tracking number
        tracking_number = tracking_number or ShipmentManager.generate_tracking_number()
        courier_name = courier_name or "Australia Post"

        # Create shipment
        shipment = Shipment(
            order_id=order_id,
            tracking_number=tracking_number,
            courier_name=courier_name,
            packed_at=datetime.now(),
            packing_notes=packing_notes,
        )
        db.add(shipment)

        # Update order
        order.status = OrderStatus.PROCESSING
        order.tracking_number = tracking_number

        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def mark_as_shipped(db: Session, shipment_id: int) -> Shipment:
        """Mark shipment as shipped"""
        shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if not shipment:
            raise ValueError("Shipment not found")

        if shipment.shipped_at is not None:
            raise ValueError("Shipment already marked as shipped")

        shipment.shipped_at = datetime.now()

        # Update order status
        order = shipment.order
        order.status = OrderStatus.SHIPPED
        order.shipped_at = datetime.now()

        # Confirm sale in inventory
        for item in order.items:
            from app.services import InventoryManager

            InventoryManager.confirm_sale(db, item.product_id, item.quantity)

        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def mark_as_delivered(
        db: Session, shipment_id: int, delivery_notes: Optional[str] = None
    ) -> Shipment:
        """Mark shipment as delivered"""
        shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if not shipment:
            raise ValueError("Shipment not found")

        if shipment.delivered_at is not None:
            raise ValueError("Shipment already marked as delivered")

        shipment.delivered_at = datetime.now()
        shipment.delivery_notes = delivery_notes

        # Update order status
        order = shipment.order
        order.status = OrderStatus.DELIVERED
        order.delivered_at = datetime.now()

        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def get_pending_shipments(db: Session) -> List[Order]:
        """Get orders ready for shipment"""
        return (
            db.query(Order)
            .filter(Order.status == OrderStatus.PAID)
            .order_by(Order.paid_at)
            .all()
        )
