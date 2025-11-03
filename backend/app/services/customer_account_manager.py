from sqlalchemy.orm import Session
from typing import Optional, Tuple

from app.database.models import Account, Customer, UserRole
from app.api_schemas import CustomerCreate
from app.utils.security import get_password_hash


class CustomerAccountManager:
    """Handles customer registration, profile management, and account operations"""

    @staticmethod
    def register_customer(
        db: Session, customer_data: CustomerCreate
    ) -> Tuple[Customer, Account]:
        """Register new customer with account"""
        # Check if email already exists
        existing = (
            db.query(Account).filter(Account.email == customer_data.email).first()
        )
        if existing:
            raise ValueError("Email already registered")

        # Create account
        account = Account(
            email=customer_data.email,
            hashed_password=get_password_hash(customer_data.password),
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=False,  # Email verification would happen here
        )
        db.add(account)
        db.flush()

        # Create customer
        customer = Customer(
            account_id=account.id,
            first_name=customer_data.first_name,
            last_name=customer_data.last_name,
            phone=customer_data.phone,
            email=customer_data.email,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        return customer, account

    @staticmethod
    def get_customer_by_account(db: Session, account: Account) -> Optional[Customer]:
        """Get customer by account"""
        return db.query(Customer).filter(Customer.account_id == account.id).first()

    @staticmethod
    def create_guest_customer(
        db: Session,
        email: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
    ) -> Customer:
        """Create guest customer without account"""
        customer = Customer(
            account_id=None,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email=email,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer
