"""
Orders router - Customer order management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api_schemas import OrderResponse, OrderListResponse
from app.services import CustomerAccountManager
from app.services import OrderTracker
from app.utils.security import get_current_active_user
from app.database.models import Account

router = APIRouter()


@router.get("", response_model=OrderListResponse)
def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_active_user),
):
    """
    Get all orders for authenticated customer

    Returns paginated list of customer's orders sorted by date (newest first)
    """
    customer = CustomerAccountManager.get_customer_by_account(db, current_account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    orders, total = OrderTracker.get_customer_orders(db, customer.id, page, page_size)

    return OrderListResponse(orders=orders, total=total, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_active_user),
):
    """
    Get specific order details

    Only accessible by order owner
    """
    customer = CustomerAccountManager.get_customer_by_account(db, current_account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    from app.database.models import Order

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.customer_id != customer.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this order"
        )

    return order
