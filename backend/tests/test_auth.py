"""Tests for authentication endpoints"""

from fastapi import status


class TestAuth:
    """Test authentication endpoints"""

    def test_register_customer(self, client):
        """Test customer registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newcustomer@test.com",
                "password": "securepass123",
                "first_name": "New",
                "last_name": "Customer",
                "phone": "0400123456",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newcustomer@test.com"
        assert data["first_name"] == "New"
        assert data["last_name"] == "Customer"
        assert "id" in data

    def test_register_duplicate_email(self, client, test_customer_account):
        """Test registration with existing email"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test.customer@test.com",
                "password": "password123",
                "first_name": "Duplicate",
                "last_name": "User",
                "phone": "0400000000",
            },
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, client, test_customer_account):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            data={"username": "test.customer@test.com", "password": "testpass123"},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client, test_customer_account):
        """Test login with wrong password"""
        response = client.post(
            "/api/auth/login",
            data={"username": "test.customer@test.com", "password": "wrongpassword"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/api/auth/login",
            data={"username": "nonexistent@test.com", "password": "password123"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user(self, client, auth_headers_customer):
        """Test getting current user profile"""
        response = client.get("/api/auth/me", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test.customer@test.com"
        assert data["role"] == "customer"

    def test_get_current_staff_profile(self, client, auth_headers_staff):
        """Test getting staff profile returns employee metadata"""
        response = client.get("/api/auth/me", headers=auth_headers_staff)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test.staff@test.com"
        assert data["role"] == "staff"
        assert data["employee_number"] == "STF-001"

    def test_get_current_manager_profile(self, client, auth_headers_manager):
        """Test getting manager profile returns employee metadata"""
        response = client.get("/api/auth/me", headers=auth_headers_manager)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test.manager@test.com"
        assert data["role"] == "manager"
        assert data["employee_number"] == "MGR-001"

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
