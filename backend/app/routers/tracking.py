"""
Order tracking router - Track orders without authentication
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api_schemas import OrderTrackingRequest, OrderTrackingResponse
from app.services import OrderTracker

router = APIRouter()


@router.get("", response_model=OrderTrackingResponse)
def track_order_get(order_number: str, email: str, db: Session = Depends(get_db)):
    """
    Track order by order number and email (GET method with query params)

    Allows both registered and guest customers to track their orders.
    Email is used for verification.
    """
    order = OrderTracker.get_order_by_number(db, order_number, email)

    if not order:
        raise HTTPException(
            status_code=404, detail="Order not found or email does not match"
        )

    status_history = OrderTracker.get_order_status_history(order)

    return OrderTrackingResponse(
        order_number=order.order_number,
        status=order.status,
        tracking_number=order.tracking_number,
        estimated_delivery=order.estimated_delivery,
        shipped_at=order.shipped_at,
        delivered_at=order.delivered_at,
        status_history=status_history,
    )


@router.post("", response_model=OrderTrackingResponse)
def track_order(tracking_data: OrderTrackingRequest, db: Session = Depends(get_db)):
    """
    Track order by order number and email (POST method with body)

    Allows both registered and guest customers to track their orders.
    Email is used for verification.
    """
    order = OrderTracker.get_order_by_number(
        db, tracking_data.order_number, tracking_data.email
    )

    if not order:
        raise HTTPException(
            status_code=404, detail="Order not found or email does not match"
        )

    status_history = OrderTracker.get_order_status_history(order)

    return OrderTrackingResponse(
        order_number=order.order_number,
        status=order.status,
        tracking_number=order.tracking_number,
        estimated_delivery=order.estimated_delivery,
        shipped_at=order.shipped_at,
        delivered_at=order.delivered_at,
        status_history=status_history,
    )
