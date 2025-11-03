"""
Shopping cart router
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.database.database import get_db
from app.api_schemas import CartResponse, CartItemAdd, CartItemUpdate, CartItemResponse
from app.services import ShoppingCartManager, CustomerAccountManager
from app.utils.security import get_current_user_optional
from app.database.models import Account

router = APIRouter()


def get_cart_id(
    db: Session = Depends(get_db),
    current_account: Optional[Account] = Depends(get_current_user_optional),
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> int:
    """Get or create shopping cart for customer or session"""
    customer_id = None

    if current_account:
        customer = CustomerAccountManager.get_customer_by_account(db, current_account)
        customer_id = customer.id if customer else None

    # Generate session ID if not provided
    if not session_id and not customer_id:
        session_id = str(uuid.uuid4())

    cart = ShoppingCartManager.get_or_create_cart(db, customer_id, session_id)
    return cart.id


@router.get("", response_model=CartResponse)
def get_cart(cart_id: int = Depends(get_cart_id), db: Session = Depends(get_db)):
    """
    Get shopping cart with all items

    Uses customer account if logged in, otherwise uses session ID from X-Session-ID header
    """
    cart = ShoppingCartManager.get_cart_with_items(db, cart_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    totals = ShoppingCartManager.calculate_cart_totals(db, cart)

    # Build response
    cart_items = []
    for item in cart.items:
        cart_items.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
                line_total=item.product.price * item.quantity,
            )
        )

    return CartResponse(
        id=cart.id,
        items=cart_items,
        subtotal=totals["subtotal"],
        estimated_tax=totals["tax"],
        estimated_shipping=totals["shipping"],
        estimated_total=totals["total"],
    )


@router.post("/items", response_model=CartItemResponse, status_code=201)
def add_to_cart(
    item_data: CartItemAdd,
    cart_id: int = Depends(get_cart_id),
    db: Session = Depends(get_db),
):
    """
    Add item to shopping cart

    If item already exists, quantity is added to existing quantity
    """
    try:
        cart_item = ShoppingCartManager.add_item(
            db, cart_id, item_data.product_id, item_data.quantity
        )

        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            product_name=cart_item.product.name,
            product_price=cart_item.product.price,
            quantity=cart_item.quantity,
            line_total=cart_item.product.price * cart_item.quantity,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/items/{item_id}", response_model=Optional[CartItemResponse])
def update_cart_item(
    item_id: int, item_data: CartItemUpdate, db: Session = Depends(get_db)
):
    """
    Update cart item quantity

    Set quantity to 0 to remove item
    """
    try:
        cart_item = ShoppingCartManager.update_item(db, item_id, item_data.quantity)

        if not cart_item:
            return None  # Item was removed

        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            product_name=cart_item.product.name,
            product_price=cart_item.product.price,
            quantity=cart_item.quantity,
            line_total=cart_item.product.price * cart_item.quantity,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/items/{item_id}", status_code=204)
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    """
    Remove item from cart
    """
    ShoppingCartManager.remove_item(db, item_id)
    return None


@router.delete("", status_code=204)
def clear_cart(cart_id: int = Depends(get_cart_id), db: Session = Depends(get_db)):
    """
    Clear all items from cart
    """
    ShoppingCartManager.clear_cart(db, cart_id)
    return None
