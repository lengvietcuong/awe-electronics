"""Tests for product endpoints"""

from fastapi import status


class TestProducts:
    """Test product browsing and management endpoints"""

    def test_get_products(self, client, test_products):
        """Test getting list of products"""
        response = client.get("/api/products")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert len(data["products"]) >= 3

    def test_get_products_with_category_filter(self, client, test_products):
        """Test filtering products by category"""
        response = client.get("/api/products?category=Computing")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["products"]) >= 2
        for item in data["products"]:
            assert item["category"] == "Computing"

    def test_get_products_with_price_filter(self, client, test_products):
        """Test filtering products by price range"""
        response = client.get("/api/products?min_price=100&max_price=500")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for item in data["products"]:
            assert 100 <= item["price"] <= 500

    def test_search_products(self, client, test_products):
        """Test searching products"""
        response = client.get("/api/products?search=macbook")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["products"]) >= 1
        assert "macbook" in data["products"][0]["name"].lower()

    def test_get_product_by_id(self, client, test_products):
        """Test getting single product by ID"""
        product_id = test_products[0].id
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == "Test Laptop"

    def test_get_nonexistent_product(self, client):
        """Test getting product that doesn't exist"""
        response = client.get("/api/products/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_categories(self, client, test_products):
        """Test getting list of categories"""
        response = client.get("/api/products/categories")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "categories" in data
        categories = data["categories"]
        assert isinstance(categories, list)
        assert "Computing" in categories
        assert "Audio" in categories


class TestProductManagement:
    """Test product management endpoints (admin only)"""

    def test_create_product_as_staff(self, client, auth_headers_staff):
        """Test creating a product as staff"""
        response = client.post(
            "/api/admin/products",
            headers=auth_headers_staff,
            json={
                "name": "New Test Product",
                "description": "A brand new test product",
                "price": 599.99,
                "category": "Computing",
                "brand": "TestBrand",
                "model_number": "NTP-2000",
                "stock_quantity": 15,
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Test Product"
        assert data["price"] == 599.99
        assert data["is_active"] is True

    def test_create_product_unauthorized(self, client):
        """Test creating product without authentication"""
        response = client.post(
            "/api/admin/products",
            json={
                "name": "Unauthorized Product",
                "description": "Should not be created",
                "price": 99.99,
                "category": "Test",
                "brand": "Test",
                "model": "TEST",
                "stock_quantity": 10,
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_product(self, client, auth_headers_staff, test_products):
        """Test updating a product"""
        product_id = test_products[0].id
        response = client.put(
            f"/api/admin/products/{product_id}",
            headers=auth_headers_staff,
            json={
                "name": "Updated Test Laptop",
                "price": 1399.99,
                "stock_quantity": 20,
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Test Laptop"
        assert data["price"] == 1399.99

    def test_discontinue_product(self, client, auth_headers_staff, test_products):
        """Test discontinuing a product"""
        product_id = test_products[2].id
        response = client.post(
            f"/api/admin/products/{product_id}/discontinue", headers=auth_headers_staff
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_discontinued"] is True

    def test_delete_product(self, client, auth_headers_manager, test_products):
        """Test deleting a product (manager only)"""
        product_id = test_products[2].id
        response = client.delete(
            f"/api/admin/products/{product_id}", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
