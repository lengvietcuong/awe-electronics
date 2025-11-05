"""Pytest configuration and fixtures"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database.database import get_db
from app.database.models import Account, Customer, Employee, Product, UserRole
from app.main import app
from app.utils.security import get_password_hash
from app.config import settings


# Test database URL - using the same database for integration tests
TEST_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with database session override"""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_manager(db):
    """Create a test manager account"""
    account = Account(
        email="test.manager@test.com",
        hashed_password=get_password_hash("testpass123"),
        role=UserRole.MANAGER,
        is_active=True,
        is_verified=True,
    )
    db.add(account)
    db.flush()

    employee = Employee(
        account_id=account.id,
        first_name="Test",
        last_name="Manager",
        employee_number="MGR-001",
    )
    db.add(employee)
    db.commit()
    db.refresh(account)
    db.refresh(employee)
    return account, employee


@pytest.fixture
def test_staff(db):
    """Create a test staff account"""
    account = Account(
        email="test.staff@test.com",
        hashed_password=get_password_hash("testpass123"),
        role=UserRole.STAFF,
        is_active=True,
        is_verified=True,
    )
    db.add(account)
    db.flush()

    employee = Employee(
        account_id=account.id,
        first_name="Test",
        last_name="Staff",
        employee_number="STF-001",
    )
    db.add(employee)
    db.commit()
    db.refresh(account)
    db.refresh(employee)
    return account, employee


@pytest.fixture
def test_customer_account(db):
    """Create a test customer account"""
    account = Account(
        email="test.customer@test.com",
        hashed_password=get_password_hash("testpass123"),
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db.add(account)
    db.flush()

    customer = Customer(
        account_id=account.id,
        first_name="Test",
        last_name="Customer",
        email="test.customer@test.com",
        phone="0400000000",
    )
    db.add(customer)
    db.commit()
    db.refresh(account)
    db.refresh(customer)

    return account, customer


@pytest.fixture
def test_products(db):
    """Create test products"""
    products = [
        Product(
            name="Test Laptop",
            description="A test laptop",
            price=1200.00,
            category="Computing",
            brand="TestBrand",
            model_number="TL-1000",
            stock_quantity=10,
            reserved_quantity=0,
            is_active=True,
        ),
        Product(
            name="Test Headphones",
            description="Test wireless headphones",
            price=299.00,
            category="Audio",
            brand="TestAudio",
            model_number="TH-500",
            stock_quantity=25,
            reserved_quantity=0,
            is_active=True,
        ),
        Product(
            name="Test Mouse",
            description="Test gaming mouse",
            price=79.99,
            category="Computing",
            brand="TestGaming",
            model_number="TM-100",
            stock_quantity=50,
            reserved_quantity=0,
            is_active=True,
        ),
    ]

    for product in products:
        db.add(product)
    db.commit()

    for product in products:
        db.refresh(product)

    return products


@pytest.fixture
def auth_headers_customer(client, test_customer_account):
    """Get authentication headers for customer"""
    response = client.post(
        "/api/auth/login",
        data={"username": "test.customer@test.com", "password": "testpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_staff(client, test_staff):
    """Get authentication headers for staff"""
    response = client.post(
        "/api/auth/login",
        data={"username": "test.staff@test.com", "password": "testpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_manager(client, test_manager):
    """Get authentication headers for manager"""
    response = client.post(
        "/api/auth/login",
        data={"username": "test.manager@test.com", "password": "testpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
