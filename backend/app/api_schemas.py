"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================


class UserRole(str, Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    MANAGER = "manager"


class OrderStatus(str, Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    PAYMENT_FAILED = "PAYMENT_FAILED"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "CREDIT_CARD"
    PAYPAL = "PAYPAL"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class ShippingMethod(str, Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"


# ============================================================================
# CUSTOMER & ACCOUNT SCHEMAS
# ============================================================================


class CustomerCreate(BaseModel):
    """Schema for customer registration"""

    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None


class CustomerLogin(BaseModel):
    """Schema for customer login"""

    email: EmailStr
    password: str


class CustomerResponse(BaseModel):
    """Customer data response"""

    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: str = "customer"
    created_at: datetime

    class Config:
        from_attributes = True


class AccountProfileResponse(BaseModel):
    """Generic account profile for any role"""

    id: int
    email: EmailStr
    role: UserRole
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str] = None
    employee_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""

    email: Optional[str] = None
    role: Optional[str] = None


# ============================================================================
# DELIVERY ADDRESS SCHEMAS
# ============================================================================


class DeliveryAddressCreate(BaseModel):
    """Create delivery address"""

    street_address: str = Field(..., min_length=5, max_length=255)
    suburb: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=50)
    postcode: str = Field(..., min_length=4, max_length=10)
    country: str = Field(default="Australia", max_length=100)
    is_default: bool = False


class DeliveryAddressResponse(BaseModel):
    """Delivery address response"""

    id: int
    street_address: str
    suburb: str
    state: str
    postcode: str
    country: str
    is_default: bool

    class Config:
        from_attributes = True


# ============================================================================
# PRODUCT SCHEMAS
# ============================================================================


class ProductCreate(BaseModel):
    """Create new product (admin only)"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    brand: Optional[str] = None
    model_number: Optional[str] = None
    specifications: Optional[str] = None
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    image_url: Optional[str] = None
    low_stock_threshold: int = Field(default=10, ge=0)


class ProductUpdate(BaseModel):
    """Update product (admin only)"""

    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model_number: Optional[str] = None
    specifications: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_discontinued: Optional[bool] = None


class ProductResponse(BaseModel):
    """Product data response"""

    id: int
    name: str
    description: Optional[str]
    category: str
    brand: Optional[str]
    model_number: Optional[str]
    specifications: Optional[str]
    price: float
    stock_quantity: int
    available_quantity: int
    is_available: bool
    is_low_stock: bool
    image_url: Optional[str]
    is_active: bool
    is_discontinued: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductStockAdjustment(BaseModel):
    """Adjust stock quantity by delta"""

    delta: int = Field(..., description="Positive to add stock, negative to remove")
    reason: Optional[str] = Field(
        default=None,
        description="Optional note explaining the adjustment",
    )


class ProductListResponse(BaseModel):
    """Paginated product list"""

    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================================
# SHOPPING CART SCHEMAS
# ============================================================================


class CartItemAdd(BaseModel):
    """Add item to cart"""

    product_id: int
    quantity: int = Field(..., ge=1)


class CartItemUpdate(BaseModel):
    """Update cart item quantity"""

    quantity: int = Field(..., ge=0)  # 0 to remove


class CartItemResponse(BaseModel):
    """Cart item response"""

    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """Shopping cart response"""

    id: int
    items: List[CartItemResponse]
    subtotal: float
    estimated_tax: float
    estimated_shipping: float
    estimated_total: float

    class Config:
        from_attributes = True


# ============================================================================
# ORDER & CHECKOUT SCHEMAS
# ============================================================================


class CheckoutRequest(BaseModel):
    """Checkout request"""

    delivery_address_id: Optional[int] = None  # If null, provide address
    delivery_address: Optional[DeliveryAddressCreate] = None  # For guest/new address
    shipping_method: ShippingMethod = ShippingMethod.STANDARD
    payment_method: PaymentMethod

    # Guest customer info (if not logged in)
    guest_email: Optional[EmailStr] = None
    guest_first_name: Optional[str] = None
    guest_last_name: Optional[str] = None
    guest_phone: Optional[str] = None

    # Payment details (mock for hackathon)
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    paypal_email: Optional[EmailStr] = None


class OrderItemResponse(BaseModel):
    """Order item response"""

    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Order response"""

    id: int
    order_number: str
    customer_id: int
    status: OrderStatus
    shipping_method: ShippingMethod
    subtotal: float
    shipping_cost: float
    tax_amount: float
    total_amount: float
    tracking_number: Optional[str]
    estimated_delivery: Optional[datetime]
    created_at: datetime
    paid_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    items: List[OrderItemResponse]
    delivery_address: DeliveryAddressResponse

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Paginated order list"""

    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int


# ============================================================================
# PAYMENT SCHEMAS
# ============================================================================


class PaymentResponse(BaseModel):
    """Payment response"""

    id: int
    order_id: int
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    amount: float
    transaction_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================================
# SHIPMENT SCHEMAS
# ============================================================================


class ShipmentCreate(BaseModel):
    """Create shipment (staff only)"""

    order_id: int
    packing_notes: Optional[str] = None


class ShipmentDispatchRequest(BaseModel):
    """Ship order with optional tracking details"""

    tracking_number: Optional[str] = None
    courier_name: Optional[str] = Field(
        default=None, description="Defaults to Australia Post if omitted"
    )
    packing_notes: Optional[str] = None


class ShipmentResponse(BaseModel):
    """Shipment response"""

    id: int
    order_id: int
    tracking_number: str
    courier_name: str
    packed_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    packing_notes: Optional[str]
    delivery_notes: Optional[str]

    class Config:
        from_attributes = True


# ============================================================================
# REPORTS SCHEMAS
# ============================================================================


class SalesReportRequest(BaseModel):
    """Sales report request"""

    start_date: datetime
    end_date: datetime
    compare_previous_period: bool = False
    export_format: str = "json"  # json, csv


class SalesReportResponse(BaseModel):
    """Sales report response"""

    period_start: datetime
    period_end: datetime
    period: dict  # Contains start_date and end_date
    total_sales: float
    total_orders: int
    average_order_value: float
    top_products: List[dict]
    sales_by_category: List[dict]
    daily_trend: List[dict]
    comparison: Optional[dict] = None


class InventoryReportResponse(BaseModel):
    """Inventory report response"""

    total_products: int
    low_stock_products: int
    out_of_stock_products: int
    total_inventory_value: float
    products_by_category: List[dict]


# ============================================================================
# TRACKING SCHEMAS
# ============================================================================


class OrderTrackingRequest(BaseModel):
    """Track order by order number"""

    order_number: str
    email: EmailStr  # For verification


class OrderTrackingResponse(BaseModel):
    """Order tracking response"""

    order_number: str
    status: OrderStatus
    tracking_number: Optional[str]
    estimated_delivery: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    status_history: List[dict]
