"""
Authentication router - Customer registration and login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.database import get_db
from app.api_schemas import CustomerCreate, CustomerResponse, Token
from app.services import CustomerAccountManager
from app.utils.security import (
    create_access_token,
    verify_password,
    get_current_active_user,
)
from app.database.models import Account
from app.config import settings

router = APIRouter()


@router.post(
    "/register", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED
)
def register(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """
    Register new customer account

    Creates a customer account with authentication credentials.
    Email verification would be sent in production.
    """
    try:
        customer, account = CustomerAccountManager.register_customer(db, customer_data)
        return customer
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Customer login with email and password

    Returns JWT access token for authenticated requests.
    """
    # Find account by email (username field in OAuth2 form)
    account = db.query(Account).filter(Account.email == form_data.username).first()

    if not account or not verify_password(form_data.password, account.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Account is inactive"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": account.email, "role": account.role.value},
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=CustomerResponse)
def get_current_customer(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_active_user),
):
    """
    Get current customer profile

    Requires authentication.
    """
    customer = CustomerAccountManager.get_customer_by_account(db, current_account)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer profile not found"
        )

    return customer
