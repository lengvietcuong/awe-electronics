"""
Database models for AWE Electronics Online Store
Following the object-oriented design from requirements
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.database import Base


class UserRole(enum.Enum):
    """User roles for authorization"""

    CUSTOMER = "customer"
    STAFF = "staff"
    MANAGER = "manager"


class OrderStatus(enum.Enum):
    """Order status lifecycle"""

    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    PAYMENT_FAILED = "PAYMENT_FAILED"


class PaymentMethod(enum.Enum):
    """Payment method types"""

    CREDIT_CARD = "CREDIT_CARD"
    PAYPAL = "PAYPAL"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(enum.Enum):
    """Payment status"""

    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class ShippingMethod(enum.Enum):
    """Shipping method options"""

    STANDARD = "STANDARD"  # 5-7 days
    EXPRESS = "EXPRESS"  # 2-3 days


# ============================================================================
# CORE DATA-HOLDER CLASSES (Domain Entities)
# ============================================================================


class Account(Base):
    """User account with authentication credentials"""

    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="account", uselist=False)
    employee = relationship("Employee", back_populates="account", uselist=False)


class Customer(Base):
    """Customer personal information"""

    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(
        Integer, ForeignKey("accounts.id"), nullable=True
    )  # Nullable for guest customers
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=False)  # Also store for guest customers
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    account = relationship("Account", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    shopping_carts = relationship("ShoppingCart", back_populates="customer")
    delivery_addresses = relationship("DeliveryAddress", back_populates="customer")


class Employee(Base):
    """Employee information for staff and managers"""

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    employee_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    account = relationship("Account", back_populates="employee")


class Product(Base):
    """Product entity with behavior (availability checks, validation)"""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    model_number = Column(String(100), nullable=True)
    specifications = Column(Text, nullable=True)  # JSON string
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    reserved_quantity = Column(Integer, default=0, nullable=False)  # For pending orders
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_discontinued = Column(Boolean, default=False)
    low_stock_threshold = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

    @property
    def available_quantity(self):
        """Calculate available stock (total - reserved)"""
        return self.stock_quantity - self.reserved_quantity

    @property
    def is_available(self):
        """Check if product is available for purchase"""
        return (
            self.is_active and not self.is_discontinued and self.available_quantity > 0
        )

    @property
    def is_low_stock(self):
        """Check if stock is below threshold"""
        return self.available_quantity <= self.low_stock_threshold


class DeliveryAddress(Base):
    """Delivery address with validation behavior"""

    __tablename__ = "delivery_addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    street_address = Column(String(255), nullable=False)
    suburb = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    postcode = Column(String(10), nullable=False)
    country = Column(String(100), default="Australia", nullable=False)
    is_default = Column(Boolean, default=False)

    # Relationships
    customer = relationship("Customer", back_populates="delivery_addresses")
    orders = relationship("Order", back_populates="delivery_address")


class ShoppingCart(Base):
    """Shopping cart for customers"""

    __tablename__ = "shopping_carts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    session_id = Column(String(255), nullable=True)  # For guest users
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="shopping_carts")
    items = relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    """Individual item in shopping cart"""

    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("shopping_carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cart = relationship("ShoppingCart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    """Order entity with state management behavior"""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    delivery_address_id = Column(
        Integer, ForeignKey("delivery_addresses.id"), nullable=False
    )

    status = Column(
        SQLEnum(OrderStatus), default=OrderStatus.PENDING_PAYMENT, nullable=False
    )
    shipping_method = Column(
        SQLEnum(ShippingMethod), default=ShippingMethod.STANDARD, nullable=False
    )

    # Pricing
    subtotal = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, nullable=False)  # GST
    total_amount = Column(Float, nullable=False)

    # Tracking
    tracking_number = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    delivery_address = relationship("DeliveryAddress", back_populates="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
    payment = relationship("Payment", back_populates="order", uselist=False)
    shipment = relationship("Shipment", back_populates="order", uselist=False)
    invoice = relationship("Invoice", back_populates="order", uselist=False)


class OrderItem(Base):
    """Individual item in an order (snapshot of product at purchase time)"""

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Snapshot at time of order
    product_name = Column(String(255), nullable=False)
    product_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Payment(Base):
    """Payment transaction record"""

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_status = Column(
        SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False
    )

    amount = Column(Float, nullable=False)
    transaction_id = Column(String(255), nullable=True)  # From payment gateway

    # Payment details (masked for security)
    card_last_four = Column(String(4), nullable=True)
    payment_email = Column(String(255), nullable=True)  # For PayPal

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="payment")
    receipt = relationship("Receipt", back_populates="payment", uselist=False)


class Receipt(Base):
    """Payment receipt document"""

    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)

    receipt_number = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    payment = relationship("Payment", back_populates="receipt")


class Invoice(Base):
    """Invoice document"""

    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    invoice_number = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="invoice")


class Shipment(Base):
    """Shipment tracking information"""

    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    tracking_number = Column(String(100), nullable=False, unique=True)
    courier_name = Column(String(100), default="Australia Post", nullable=False)

    # Timestamps
    packed_at = Column(DateTime(timezone=True), nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    # Notes
    packing_notes = Column(Text, nullable=True)
    delivery_notes = Column(Text, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="shipment")


# ============================================================================
# NOTIFICATION LOG (For tracking email notifications)
# ============================================================================


class NotificationLog(Base):
    """Log of notifications sent"""

    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    recipient_email = Column(String(255), nullable=False)
    notification_type = Column(
        String(50), nullable=False
    )  # order_confirmation, shipment, etc.
    subject = Column(String(255), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
