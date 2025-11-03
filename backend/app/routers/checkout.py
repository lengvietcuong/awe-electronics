"""
Checkout router - Place orders and process payments
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.api_schemas import CheckoutRequest, OrderResponse
from app.services import (
    ShoppingCartManager,
    CustomerAccountManager,
    OrderProcessor,
    PaymentProcessor,
)
from app.services import NotificationService
from app.utils.security import get_current_user_optional
from app.database.models import Account, DeliveryAddress

router = APIRouter()


@router.post("", status_code=200)
def checkout(
    checkout_data: CheckoutRequest,
    db: Session = Depends(get_db),
    current_account: Optional[Account] = Depends(get_current_user_optional),
):
    """
    Complete checkout process

    Supports both registered customer and guest checkout.
    For guest checkout, provide guest_email, guest_first_name, guest_last_name.

    Process:
    1. Validate cart
    2. Create/verify delivery address
    3. Create order
    4. Process payment
    5. Send notifications
    """
    # Get or create customer
    customer = None
    if current_account:
        # Registered customer
        customer = CustomerAccountManager.get_customer_by_account(db, current_account)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer profile not found")

        cart = ShoppingCartManager.get_or_create_cart(db, customer_id=customer.id)
    else:
        # Guest checkout
        if not all(
            [
                checkout_data.guest_email,
                checkout_data.guest_first_name,
                checkout_data.guest_last_name,
            ]
        ):
            raise HTTPException(
                status_code=400,
                detail="Guest checkout requires email, first name, and last name",
            )

        customer = CustomerAccountManager.create_guest_customer(
            db,
            checkout_data.guest_email,
            checkout_data.guest_first_name,
            checkout_data.guest_last_name,
            checkout_data.guest_phone,
        )

        # For guest, we need session ID - for simplicity, create new cart
        cart = ShoppingCartManager.get_or_create_cart(db, customer_id=customer.id)

    # Validate cart
    if not cart.items:
        raise HTTPException(status_code=422, detail="Cart is empty")

    # Get or create delivery address
    delivery_address = None
    if checkout_data.delivery_address_id:
        delivery_address = (
            db.query(DeliveryAddress)
            .filter(DeliveryAddress.id == checkout_data.delivery_address_id)
            .first()
        )
        if not delivery_address:
            raise HTTPException(status_code=404, detail="Delivery address not found")
    elif checkout_data.delivery_address:
        # Create new delivery address
        delivery_address = DeliveryAddress(
            customer_id=customer.id, **checkout_data.delivery_address.dict()
        )
        db.add(delivery_address)
        db.flush()
    else:
        raise HTTPException(status_code=400, detail="Delivery address required")

    try:
        # Create order
        order = OrderProcessor.create_order_from_cart(
            db, cart, delivery_address, checkout_data.shipping_method, customer
        )

        # Process payment
        payment_details = {}
        if checkout_data.payment_method.value == "CREDIT_CARD":
            payment_details = {
                "card_number": checkout_data.card_number,
                "card_expiry": checkout_data.card_expiry,
                "card_cvv": checkout_data.card_cvv,
            }
        elif checkout_data.payment_method.value == "PAYPAL":
            payment_details = {"paypal_email": checkout_data.paypal_email}

        payment, success = PaymentProcessor.process_payment(
            db, order, checkout_data.payment_method, payment_details
        )

        if not success:
            raise HTTPException(
                status_code=402,
                detail="Payment failed. Please try again with a different payment method.",
            )

        # Send notifications
        NotificationService.send_order_confirmation(db, order)
        NotificationService.send_payment_confirmation(db, order)

        # Clear cart
        ShoppingCartManager.clear_cart(db, cart.id)

        # Refresh and return order
        db.refresh(order)

        # Return custom response with order_id and order_number
        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "total_amount": order.total_amount,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
