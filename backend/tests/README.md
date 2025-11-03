# Test Suite

This directory contains comprehensive integration tests for the AWE Electronics backend.

## Running Tests

### Prerequisites

1. Ensure PostgreSQL is running
2. Database should be seeded with test data
3. Install test dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Run All Tests

From the project root directory:

```bash
pytest
```

### Run Specific Test Files

```bash
# Test authentication
pytest backend/tests/test_auth.py

# Test products
pytest backend/tests/test_products.py

# Test shopping cart
pytest backend/tests/test_cart.py

# Test orders and checkout
pytest backend/tests/test_orders.py

# Test reports
pytest backend/tests/test_reports.py
```

### Run Specific Test Classes or Functions

```bash
# Run a specific test class
pytest backend/tests/test_auth.py::TestAuth

# Run a specific test function
pytest backend/tests/test_auth.py::TestAuth::test_login_success
```

### Verbose Output

```bash
pytest -v
```

### Show Print Statements

```bash
pytest -s
```

### Stop on First Failure

```bash
pytest -x
```

### Run Tests Matching a Pattern

```bash
pytest -k "auth"
pytest -k "checkout or cart"
```

## Test Structure

- `conftest.py` - Pytest fixtures and configuration
- `test_auth.py` - Authentication and authorization tests
- `test_products.py` - Product browsing and management tests
- `test_cart.py` - Shopping cart functionality tests
- `test_orders.py` - Checkout, order management, and fulfillment tests
- `test_reports.py` - Manager reports and analytics tests

## Test Coverage

The test suite covers:

- **Authentication**: Registration, login, JWT tokens
- **Authorization**: Role-based access control (Customer, Staff, Manager)
- **Products**: CRUD operations, search, filtering
- **Shopping Cart**: Add, update, remove items (authenticated & guest)
- **Checkout**: Order creation, payment processing
- **Order Fulfillment**: Shipment creation, order tracking
- **Reports**: Sales analytics, inventory reports, CSV export

## Fixtures

Key fixtures available in all tests:

- `client` - FastAPI test client
- `db` - Database session
- `test_customer_account` - Pre-created customer account
- `test_staff` - Pre-created staff account
- `test_manager` - Pre-created manager account
- `test_products` - Pre-created test products
- `auth_headers_customer` - Authorization headers for customer
- `auth_headers_staff` - Authorization headers for staff
- `auth_headers_manager` - Authorization headers for manager

## Notes

- Tests run against the actual database configured in `.env`
- Each test function runs in a transaction that is rolled back after the test
- Tests can be run in parallel using `pytest-xdist`:
  ```bash
  pip install pytest-xdist
  pytest -n auto
  ```
