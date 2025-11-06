"""Tests for product endpoints"""

from fastapi import status

from app.database.models import Product


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

    def test_list_products_admin(self, client, auth_headers_staff, test_products):
        """Staff can list products with pagination metadata."""
        response = client.get("/api/admin/products", headers=auth_headers_staff)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] >= len(test_products)
        assert data["page"] == 1
        assert data["page_size"] >= len(data["products"])

    def test_list_products_with_filters(
        self, client, auth_headers_staff, test_products, db
    ):
        """Staff can filter by status and availability."""
        product_id = test_products[0].id

        # Mark one product inactive
        response = client.put(
            f"/api/admin/products/{product_id}",
            headers=auth_headers_staff,
            json={"is_active": False},
        )
        assert response.status_code == status.HTTP_200_OK

        # Another product out of stock
        out_of_stock_id = test_products[1].id
        response = client.put(
            f"/api/admin/products/{out_of_stock_id}",
            headers=auth_headers_staff,
            json={"stock_quantity": 0},
        )
        assert response.status_code == status.HTTP_200_OK

        inactive_response = client.get(
            "/api/admin/products",
            headers=auth_headers_staff,
            params={"status": "inactive"},
        )
        assert inactive_response.status_code == status.HTTP_200_OK
        inactive_data = inactive_response.json()
        assert any(prod["id"] == product_id for prod in inactive_data["products"])

        out_of_stock_response = client.get(
            "/api/admin/products",
            headers=auth_headers_staff,
            params={"availability": "out_of_stock"},
        )
        assert out_of_stock_response.status_code == status.HTTP_200_OK
        out_of_stock_data = out_of_stock_response.json()
        assert any(
            prod["id"] == out_of_stock_id for prod in out_of_stock_data["products"]
        )

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

    def test_get_product_includes_inactive(
        self, client, auth_headers_staff, test_products
    ):
        """Ensure admin can retrieve inactive product details."""
        product_id = test_products[0].id
        response = client.put(
            f"/api/admin/products/{product_id}",
            headers=auth_headers_staff,
            json={"is_active": False},
        )
        assert response.status_code == status.HTTP_200_OK

        detail_response = client.get(
            f"/api/admin/products/{product_id}", headers=auth_headers_staff
        )
        assert detail_response.status_code == status.HTTP_200_OK
        detail_data = detail_response.json()
        assert detail_data["id"] == product_id
        assert detail_data["is_active"] is False

    def test_delete_product(self, client, auth_headers_manager, test_products):
        """Test deleting a product (manager only)"""
        product_id = test_products[2].id
        response = client.delete(
            f"/api/admin/products/{product_id}", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_product_with_cart_items(
        self, client, auth_headers_manager, test_products, db
    ):
        """Test deleting a product that has items in shopping carts"""
        from app.database.models import ShoppingCart, CartItem

        # Create a cart with items
        cart = ShoppingCart(customer_id=None, session_id="test_session")
        db.add(cart)
        db.commit()
        db.refresh(cart)

        product_id = test_products[0].id
        cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=2)
        db.add(cart_item)
        db.commit()

        # Verify cart item exists
        cart_item_count = (
            db.query(CartItem).filter(CartItem.product_id == product_id).count()
        )
        assert cart_item_count == 1

        # Delete the product - this should also delete the cart items
        response = client.delete(
            f"/api/admin/products/{product_id}", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify product was deleted
        product = db.query(Product).filter(Product.id == product_id).first()
        assert product is None

        # Verify cart items were also deleted
        cart_item_count = (
            db.query(CartItem).filter(CartItem.product_id == product_id).count()
        )
        assert cart_item_count == 0

    def test_update_product_rejects_reserved_mismatch(
        self, client, auth_headers_staff, test_products, db
    ):
        """Updating stock below reserved quantity should fail."""
        product_id = test_products[0].id
        product = db.query(Product).filter(Product.id == product_id).first()
        product.reserved_quantity = 5
        db.commit()

        response = client.put(
            f"/api/admin/products/{product_id}",
            headers=auth_headers_staff,
            json={"stock_quantity": 3},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        body = response.json()
        assert "reserved" in body["detail"].lower()

    def test_get_low_stock_products(self, client, auth_headers_staff, test_products):
        """Test listing low stock products"""
        response = client.get(
            "/api/admin/products/low-stock", headers=auth_headers_staff
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert any(item["id"] == test_products[0].id for item in data)

    def test_adjust_product_stock(self, client, auth_headers_staff, test_products):
        """Test adjusting stock levels for a product"""
        product_id = test_products[0].id
        initial_stock = test_products[0].stock_quantity
        response = client.patch(
            f"/api/admin/products/{product_id}/stock",
            headers=auth_headers_staff,
            json={"delta": 5, "reason": "Restock"},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == product_id
        assert data["stock_quantity"] == initial_stock + 5

    def test_adjust_product_stock_invalid(
        self, client, auth_headers_staff, test_products
    ):
        """Test invalid stock adjustment that drops below zero"""
        product_id = test_products[0].id
        response = client.patch(
            f"/api/admin/products/{product_id}/stock",
            headers=auth_headers_staff,
            json={"delta": -999},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "stock" in data["detail"].lower()


class TestManagerPermissions:
    """Test that managers can do everything staff can, plus more"""

    def test_manager_can_list_products(
        self, client, auth_headers_manager, test_products
    ):
        """Managers should be able to list products (staff permission)"""
        response = client.get("/api/admin/products", headers=auth_headers_manager)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] >= len(test_products)

    def test_manager_can_create_product(self, client, auth_headers_manager):
        """Managers should be able to create products (staff permission)"""
        response = client.post(
            "/api/admin/products",
            headers=auth_headers_manager,
            json={
                "name": "Manager Created Product",
                "description": "Created by a manager",
                "price": 799.99,
                "category": "Computing",
                "brand": "TestBrand",
                "model_number": "MCP-3000",
                "stock_quantity": 20,
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Manager Created Product"

    def test_manager_can_update_product(
        self, client, auth_headers_manager, test_products
    ):
        """Managers should be able to update products (staff permission)"""
        product_id = test_products[0].id
        response = client.put(
            f"/api/admin/products/{product_id}",
            headers=auth_headers_manager,
            json={
                "name": "Manager Updated Product",
                "price": 1599.99,
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Manager Updated Product"

    def test_manager_can_adjust_stock(
        self, client, auth_headers_manager, test_products
    ):
        """Managers should be able to adjust stock (staff permission)"""
        product_id = test_products[0].id
        initial_stock = test_products[0].stock_quantity
        response = client.patch(
            f"/api/admin/products/{product_id}/stock",
            headers=auth_headers_manager,
            json={"delta": 10, "reason": "Manager restocking"},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["stock_quantity"] == initial_stock + 10

    def test_manager_can_get_low_stock(
        self, client, auth_headers_manager, test_products
    ):
        """Managers should be able to view low stock products (staff permission)"""
        response = client.get(
            "/api/admin/products/low-stock", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    def test_manager_can_delete_product(
        self, client, auth_headers_manager, test_products
    ):
        """Managers should be able to delete products (manager-only permission)"""
        product_id = test_products[1].id
        response = client.delete(
            f"/api/admin/products/{product_id}", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_staff_cannot_delete_product(
        self, client, auth_headers_staff, test_products
    ):
        """Staff should NOT be able to delete products (manager-only permission)"""
        product_id = test_products[2].id
        response = client.delete(
            f"/api/admin/products/{product_id}", headers=auth_headers_staff
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
