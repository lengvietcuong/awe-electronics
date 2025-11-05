"""
Admin Orders router - Order fulfillment and shipment (staff/manager only)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.api_schemas import (
    OrderResponse,
    ShipmentCreate,
    ShipmentDispatchRequest,
    ShipmentResponse,
)
from app.services import OrderProcessor
from app.services import ShipmentManager, NotificationService
from app.utils.security import get_current_staff
from app.database.models import Account, Order, OrderStatus

router = APIRouter()


@router.get("/pending", response_model=List[OrderResponse])
def get_pending_orders(
    db: Session = Depends(get_db), current_account: Account = Depends(get_current_staff)
):
    """
    Get all orders pending fulfillment (staff/manager only)

    Returns orders that are paid or processing, sorted by payment date.
    """
    orders = OrderProcessor.get_pending_orders(db)
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Get detailed order information (staff/manager only)
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.post("/{order_id}/ship", response_model=ShipmentResponse, status_code=200)
def ship_order(
    order_id: int,
    shipment_data: ShipmentDispatchRequest,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Create and ship order immediately (staff/manager only)

    Accepts tracking_number and courier_name in request body.
    """
    try:
        shipment = ShipmentManager.create_shipment(
            db,
            order_id,
            shipment_data.packing_notes,
            tracking_number=shipment_data.tracking_number,
            courier_name=shipment_data.courier_name,
        )
        shipment = ShipmentManager.mark_as_shipped(db, shipment.id)
    except ValueError as exc:
        error_message = str(exc)
        status_code = 404 if error_message == "Order not found" else 400
        raise HTTPException(status_code=status_code, detail=error_message)

    # Send notification after successful shipment
    NotificationService.send_shipment_notification(db, shipment.order)

    return shipment


@router.post("/{order_id}/shipment", response_model=ShipmentResponse, status_code=201)
def create_shipment(
    order_id: int,
    shipment_data: ShipmentCreate,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Create shipment for order (staff/manager only)

    Generates tracking number and marks order as processing.
    """
    try:
        shipment = ShipmentManager.create_shipment(
            db, order_id, shipment_data.packing_notes
        )
        return shipment
    except ValueError as exc:
        error_message = str(exc)
        status_code = 404 if error_message == "Order not found" else 400
        raise HTTPException(status_code=status_code, detail=error_message)


@router.post("/shipments/{shipment_id}/ship", response_model=ShipmentResponse)
def mark_shipped(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Mark shipment as shipped (staff/manager only)

    Updates order status to shipped and sends notification to customer.
    """
    try:
        shipment = ShipmentManager.mark_as_shipped(db, shipment_id)

        # Send shipment notification
        NotificationService.send_shipment_notification(db, shipment.order)

        return shipment
    except ValueError as exc:
        error_message = str(exc)
        status_code = 404 if error_message == "Shipment not found" else 400
        raise HTTPException(status_code=status_code, detail=error_message)


@router.post("/shipments/{shipment_id}/deliver", response_model=ShipmentResponse)
def mark_delivered(
    shipment_id: int,
    delivery_notes: str = Query(None),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Mark shipment as delivered (staff/manager only)

    Updates order status to delivered and sends confirmation to customer.
    """
    try:
        shipment = ShipmentManager.mark_as_delivered(db, shipment_id, delivery_notes)

        # Send delivery notification
        NotificationService.send_delivery_notification(db, shipment.order)

        return shipment
    except ValueError as exc:
        error_message = str(exc)
        status_code = 404 if error_message == "Shipment not found" else 400
        raise HTTPException(status_code=status_code, detail=error_message)


@router.post("/{order_id}/deliver", response_model=OrderResponse, status_code=200)
def mark_order_delivered(
    order_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Mark order as delivered (staff/manager only)

    Updates order status to delivered and sends confirmation to customer.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.shipment:
        raise HTTPException(
            status_code=400, detail="Order must be shipped before marking as delivered"
        )

    # Update order status
    order.status = OrderStatus.DELIVERED
    from datetime import datetime

    order.delivered_at = datetime.now()
    order.shipment.delivered_at = datetime.now()

    db.commit()
    db.refresh(order)

    # Send delivery notification
    NotificationService.send_delivery_notification(db, order)

    return order


@router.delete("/{order_id}", status_code=200)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Delete order and release reserved stock (staff/manager only)

    Can only delete orders that haven't been shipped.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in [
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
    ]:
        raise HTTPException(status_code=400, detail="Cannot delete shipped orders")

    # Release reserved stock
    from app.services import InventoryManager

    for item in order.items:
        InventoryManager.release_stock(db, item.product_id, item.quantity)

    # Delete related records first
    for item in order.items:
        db.delete(item)
    if order.invoice:
        db.delete(order.invoice)
    if order.shipment:
        db.delete(order.shipment)
    if order.payment:
        if order.payment.receipt:
            db.delete(order.payment.receipt)
        db.delete(order.payment)

    # Delete the order
    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully"}


@router.post("/{order_id}/cancel", status_code=200)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_staff),
):
    """
    Cancel order and release reserved stock (staff/manager only)

    Can only cancel orders that haven't been shipped.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in [
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
    ]:
        raise HTTPException(status_code=400, detail="Cannot cancel shipped orders")

    OrderProcessor.cancel_order(db, order_id)

    return {"message": "Order cancelled successfully"}
