"""Tests for shopping cart endpoints"""

from fastapi import status


class TestShoppingCart:
    """Test shopping cart functionality"""

    def test_add_to_cart_authenticated(
        self, client, auth_headers_customer, test_products
    ):
        """Test adding product to cart as authenticated user"""
        product_id = test_products[0].id
        response = client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 2},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["product_id"] == product_id
        assert data["quantity"] == 2

    def test_add_to_cart_guest(self, client, test_products):
        """Test adding product to cart as guest user"""
        product_id = test_products[1].id
        response = client.post(
            "/api/cart/items",
            headers={"X-Session-ID": "guest-session-123"},
            json={"product_id": product_id, "quantity": 1},
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["product_id"] == product_id
        assert data["quantity"] == 1

    def test_add_nonexistent_product_to_cart(self, client, auth_headers_customer):
        """Test adding non-existent product to cart"""
        response = client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": 99999, "quantity": 1},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_add_excessive_quantity(self, client, auth_headers_customer, test_products):
        """Test adding more quantity than available stock"""
        product_id = test_products[0].id
        response = client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1000},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_cart(self, client, auth_headers_customer, test_products):
        """Test getting cart contents"""
        # Add items to cart first
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 2},
        )

        # Get cart
        response = client.get("/api/cart", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert len(data["items"]) > 0
        assert "estimated_total" in data

    def test_update_cart_item_quantity(
        self, client, auth_headers_customer, test_products
    ):
        """Test updating cart item quantity"""
        # Add item first
        product_id = test_products[0].id
        add_response = client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        item_id = add_response.json()["id"]

        # Update quantity
        response = client.patch(
            f"/api/cart/items/{item_id}",
            headers=auth_headers_customer,
            json={"quantity": 3},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["quantity"] == 3

    def test_remove_from_cart(self, client, auth_headers_customer, test_products):
        """Test removing item from cart"""
        # Add item first
        product_id = test_products[1].id
        add_response = client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        item_id = add_response.json()["id"]

        # Remove item
        response = client.delete(
            f"/api/cart/items/{item_id}", headers=auth_headers_customer
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_clear_cart(self, client, auth_headers_customer, test_products):
        """Test clearing entire cart"""
        # Add multiple items
        for product in test_products[:2]:
            client.post(
                "/api/cart/items",
                headers=auth_headers_customer,
                json={"product_id": product.id, "quantity": 1},
            )

        # Clear cart
        response = client.delete("/api/cart", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify cart is empty
        get_response = client.get("/api/cart", headers=auth_headers_customer)
        data = get_response.json()
        assert len(data["items"]) == 0
