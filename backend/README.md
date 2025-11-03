# AWE Electronics Online Store - Backend API

A comprehensive e-commerce backend built with FastAPI and PostgreSQL, following object-oriented design principles.

## Features

### Customer Features

- **Product Catalogue**: Browse, search, and filter products by category, price, and keywords
- **Shopping Cart**: Add/remove items, update quantities, calculate totals with tax and shipping
- **Customer Accounts**: Register, login with JWT authentication
- **Checkout**: Support for both registered and guest checkout
- **Payment Processing**: Mock payment processing with credit card, PayPal, bank transfer (Strategy pattern)
- **Order Tracking**: Track orders by order number and email without authentication
- **Order History**: View past orders and details

### Staff Features

- **Order Fulfillment**: View pending orders, create shipments, mark as shipped/delivered
- **Product Management**: Add, update, discontinue products
- **Inventory Management**: Real-time stock tracking with reservations
- **Shipment Management**: Create tracking numbers, update delivery status

### Manager Features

- **Sales Reports**: Generate comprehensive sales analytics with period comparison
- **Inventory Reports**: View stock status, low stock alerts, total inventory value
- **Export Reports**: Download reports in JSON or CSV format
- **Quick Stats Dashboard**: Today, week, month, year-to-date statistics

## Architecture

Built following the **Object-Oriented Design** specification:

### Design Patterns

- **Strategy Pattern**: Payment processing with multiple payment methods
- **Observer Pattern**: Notification service for order events
- **Facade Pattern**: CheckoutManager simplifies complex checkout workflow
- **Repository Pattern**: Service layer abstraction

### Key Components

- **Business Logic Layer**: Service classes (OrderProcessor, PaymentProcessor, ShipmentManager, etc.)
- **Data Access Layer**: SQLAlchemy ORM models
- **API Layer**: FastAPI routers with proper separation of concerns
- **Security Layer**: JWT authentication with role-based access control

## Project Structure

```
backend/
├── app/
│   ├── database/             # Database layer
│   │   ├── database.py       # Database connection
│   │   └── models.py         # SQLAlchemy models
│   ├── routers/              # API route handlers
│   ├── services/             # Business logic (individual service files)
│   ├── utils/                # Utility modules
│   │   ├── security.py       # Authentication & authorization
│   │   └── seed_data.py      # Database seeding script
│   ├── api_schemas.py        # Pydantic models for API
│   ├── config.py             # Configuration management
│   └── main.py               # FastAPI app initialization
├── tests/                    # Comprehensive pytest test suite
├── .env                      # Environment configuration
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Prerequisites

- Python 3.9+
- PostgreSQL 13+
- pip (Python package manager)

## Setup Instructions

### 1. Database Setup

Configure your database credentials in `.env`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/awe_electronics
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The application will automatically create all tables on first run.

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Seed Database with Mock Data

```bash
python -m app.utils.seed_data
```

This creates:

- **Manager account**: manager@aweelectronics.com (password: manager123)
- **Staff account**: staff@aweelectronics.com (password: staff123)
- **5 customer accounts**: (password: password123)
  - john.doe@email.com
  - jane.smith@email.com
  - bob.wilson@email.com
  - alice.brown@email.com
  - charlie.davis@email.com
- **22+ products** across 7 categories (Audio, Computing, Mobile, Home Appliances, Gaming, Cameras, TVs)
- **60+ historical orders** with various statuses
- **3 pending orders** for fulfillment demonstration

### 4. Start the Application

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### 5. Run Tests

```bash
# From project root
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

See `tests/README.md` for detailed testing documentation.

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Quick Start Guide

### Example Workflows

#### 1. Customer Registration and Shopping

```bash
# Register new customer
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcustomer@email.com",
    "password": "password123",
    "first_name": "New",
    "last_name": "Customer",
    "phone": "0412345678"
  }'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john.doe@email.com&password=password123"

# Browse products
curl "http://localhost:8000/api/products?category=Computing&page=1&page_size=10"

# Add to cart (use token from login)
curl -X POST "http://localhost:8000/api/cart/items" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}'

# View cart
curl "http://localhost:8000/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. Checkout and Payment

```bash
# Checkout (registered customer)
curl -X POST "http://localhost:8000/api/checkout" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_address_id": 1,
    "shipping_method": "standard",
    "payment_method": "credit_card",
    "card_number": "4532123456789012",
    "card_expiry": "12/25",
    "card_cvv": "123"
  }'
```

#### 3. Order Tracking (No Auth Required)

```bash
# Track order by order number and email
curl -X POST "http://localhost:8000/api/tracking" \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "AWE20241103123456",
    "email": "john.doe@email.com"
  }'
```

#### 4. Staff - Order Fulfillment

```bash
# Login as staff
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=staff@aweelectronics.com&password=staff123"

# Get pending orders
curl "http://localhost:8000/api/admin/orders/pending" \
  -H "Authorization: Bearer STAFF_TOKEN"

# Create shipment
curl -X POST "http://localhost:8000/api/admin/orders/1/shipment" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1, "packing_notes": "Handle with care"}'

# Mark as shipped
curl -X POST "http://localhost:8000/api/admin/orders/shipments/1/ship" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

#### 5. Manager - Reports

```bash
# Login as manager
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manager@aweelectronics.com&password=manager123"

# Get quick stats
curl "http://localhost:8000/api/reports/quick-stats" \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Generate sales report
curl "http://localhost:8000/api/reports/sales?start_date=2024-10-01T00:00:00&end_date=2024-11-03T23:59:59&compare_previous=true" \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Generate inventory report
curl "http://localhost:8000/api/reports/inventory" \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Export sales report as CSV
curl "http://localhost:8000/api/reports/sales/export?start_date=2024-10-01T00:00:00&end_date=2024-11-03T23:59:59&format=csv" \
  -H "Authorization: Bearer MANAGER_TOKEN" > sales_report.csv
```

## API Endpoints Summary

### Public Endpoints

- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/products` - Browse products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/categories` - List categories
- `POST /api/tracking` - Track order (no auth)

### Customer Endpoints (Requires Authentication)

- `GET /api/auth/me` - Get current user profile
- `GET /api/cart` - Get shopping cart
- `POST /api/cart/items` - Add to cart
- `PATCH /api/cart/items/{id}` - Update cart item
- `DELETE /api/cart/items/{id}` - Remove from cart
- `POST /api/checkout` - Complete checkout
- `GET /api/orders` - List my orders
- `GET /api/orders/{id}` - Get order details

### Staff Endpoints (Requires Staff/Manager Role)

- `GET /api/admin/orders/pending` - Get pending orders
- `GET /api/admin/orders/{id}` - Get order details
- `POST /api/admin/orders/{id}/shipment` - Create shipment
- `POST /api/admin/orders/shipments/{id}/ship` - Mark as shipped
- `POST /api/admin/orders/shipments/{id}/deliver` - Mark as delivered
- `POST /api/admin/orders/{id}/cancel` - Cancel order
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `POST /api/admin/products/{id}/discontinue` - Discontinue product

### Manager Endpoints (Requires Manager Role)

- `GET /api/reports/sales` - Generate sales report
- `GET /api/reports/sales/export` - Export sales report
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/quick-stats` - Get dashboard stats

## Database Schema

### Core Tables

- **accounts** - User authentication
- **customers** - Customer information
- **employees** - Staff and manager information
- **products** - Product catalogue
- **shopping_carts** - Customer shopping carts
- **cart_items** - Items in shopping carts
- **orders** - Customer orders
- **order_items** - Items in orders
- **payments** - Payment transactions
- **receipts** - Payment receipts
- **invoices** - Order invoices
- **shipments** - Delivery information
- **delivery_addresses** - Customer addresses
- **notification_logs** - Email notification logs

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **Role-Based Access Control**: Customer, Staff, Manager roles
- **SQL Injection Protection**: Parameterized queries via SQLAlchemy ORM
- **CORS Configuration**: Configurable CORS for production deployment

## Testing

The application includes a comprehensive test suite with 49+ test cases covering all major functionality.

### Test Accounts

**Manager:**

- Email: manager@aweelectronics.com
- Password: manager123

**Staff:**

- Email: staff@aweelectronics.com
- Password: staff123

**Customers:**

- Email: john.doe@email.com
- Password: password123

## Design Highlights

### Object-Oriented Design

- Follows CRC (Class-Responsibility-Collaborator) cards from specification
- Clear separation of concerns with service layer
- Business logic classes: OrderProcessor, PaymentProcessor, ShipmentManager, etc.
- Data-holder classes with behavior: Product, Order, DeliveryAddress

### Design Patterns

- **Strategy**: PaymentProcessor handles multiple payment methods
- **Observer**: NotificationService monitors order events
- **Facade**: CheckoutManager simplifies complex workflows

### Best Practices

- RESTful API design
- Comprehensive error handling
- Input validation with Pydantic
- Transaction management
- Stock reservation to prevent overselling
- Automatic notifications at key stages

## Production Considerations

For production deployment, consider:

- Environment variables for sensitive data
- Database connection pooling
- Redis for session management
- Celery for background tasks (emails, reports)
- Rate limiting
- Logging and monitoring
- SSL/TLS encryption
- CDN for static assets

**Built using FastAPI, PostgreSQL, and Object-Oriented Design principles**
