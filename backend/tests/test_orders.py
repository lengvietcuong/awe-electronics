"""Tests for checkout and order endpoints"""

from fastapi import status


class TestCheckout:
    """Test checkout functionality"""

    def test_checkout_authenticated_customer(
        self, client, auth_headers_customer, test_products, test_customer_account
    ):
        """Test checkout for authenticated customer"""
        # Add items to cart
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        # Checkout
        response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "order_number" in data
        assert data["status"] == "PAID"
        assert "order_id" in data

    def test_checkout_guest_customer(self, client, test_products):
        """Test checkout for guest customer"""
        session_id = "guest-session-456"

        # Add items to cart
        product_id = test_products[1].id
        client.post(
            "/api/cart/items",
            headers={"X-Session-ID": session_id},
            json={"product_id": product_id, "quantity": 1},
        )

        # Checkout as guest
        response = client.post(
            "/api/checkout",
            headers={"X-Session-ID": session_id},
            json={
                "guest_email": "guest@test.com",
                "guest_first_name": "Guest",
                "guest_last_name": "User",
                "guest_phone": "0400999888",
                "payment_method": "PAYPAL",
                "shipping_method": "EXPRESS",
                "delivery_address": {
                    "street_address": "456 Guest Ave",
                    "suburb": "Guesttown",
                    "state": "NSW",
                    "postcode": "2000",
                    "country": "Australia",
                },
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "order_number" in data
        assert data["status"] == "PAID"
        assert "order_id" in data

    def test_checkout_empty_cart(self, client, auth_headers_customer):
        """Test checkout with empty cart"""
        response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestOrders:
    """Test order management endpoints"""

    def test_get_customer_orders(self, client, auth_headers_customer, test_products):
        """Test getting customer's order history"""
        # Create an order first
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )

        # Get orders
        response = client.get("/api/orders", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "orders" in data
        assert len(data) > 0

    def test_get_order_details(self, client, auth_headers_customer, test_products):
        """Test getting specific order details"""
        # Create an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Get order details
        response = client.get(f"/api/orders/{order_id}", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == order_id
        assert "order_number" in data
        assert "items" in data

    def test_track_order_by_number(self, client, auth_headers_customer, test_products):
        """Test tracking order by order number and email"""
        # Create an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_number = checkout_response.json()["order_number"]

        # Track order
        response = client.get(
            f"/api/tracking?order_number={order_number}&email=test.customer@test.com"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["order_number"] == order_number
        assert "status" in data

    def test_track_order_invalid_credentials(self, client):
        """Test tracking with invalid order number or email"""
        response = client.post(
            "/api/tracking",
            json={"order_number": "INVALID123", "email": "wrong@test.com"},
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestOrderFulfillment:
    """Test order fulfillment endpoints (staff/manager only)"""

    def test_get_pending_orders(
        self, client, auth_headers_staff, auth_headers_customer, test_products
    ):
        """Test getting list of pending orders"""
        # Create an order first
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )

        # Get pending orders as staff
        response = client.get("/api/admin/orders/pending", headers=auth_headers_staff)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_shipment(
        self, client, auth_headers_staff, auth_headers_customer, test_products
    ):
        """Test creating shipment for an order"""
        # Create an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Create shipment
        response = client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_staff,
            json={
                "courier_name": "Australia Post",
                "tracking_number": "AU123456789012",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["tracking_number"] == "AU123456789012"

    def test_ship_order_twice_fails(
        self, client, auth_headers_staff, auth_headers_customer, test_products
    ):
        """Shipping an order twice should return an error"""
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # First ship should succeed
        first_response = client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_staff,
            json={"tracking_number": "AU111", "courier_name": "TestCourier"},
        )
        assert first_response.status_code == status.HTTP_200_OK

        # Second ship should fail with 400
        second_response = client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_staff,
            json={"tracking_number": "AU222"},
        )
        assert second_response.status_code == status.HTTP_400_BAD_REQUEST
        assert "shipment" in second_response.json()["detail"].lower()

    def test_mark_order_delivered(
        self, client, auth_headers_staff, auth_headers_customer, test_products
    ):
        """Test marking order as delivered"""
        # Create and ship an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )

        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Ship it
        client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_staff,
            json={
                "courier_name": "Australia Post",
                "tracking_number": "AU999888777666",
            },
        )

        # Mark as delivered
        response = client.post(
            f"/api/admin/orders/{order_id}/deliver", headers=auth_headers_staff
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "DELIVERED"


class TestManagerOrderPermissions:
    """Test that managers can access all order management endpoints (staff permissions)"""

    def test_manager_can_get_pending_orders(
        self, client, auth_headers_manager, auth_headers_customer, test_products
    ):
        """Managers should be able to view pending orders (staff permission)"""
        # Create an order first
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )

        # Manager should be able to get pending orders
        response = client.get("/api/admin/orders/pending", headers=auth_headers_manager)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    def test_manager_can_ship_order(
        self, client, auth_headers_manager, auth_headers_customer, test_products
    ):
        """Managers should be able to ship orders (staff permission)"""
        # Create an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Manager should be able to ship order
        response = client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_manager,
            json={
                "courier_name": "Australia Post",
                "tracking_number": "AU123456789",
            },
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["tracking_number"] == "AU123456789"

    def test_manager_can_mark_delivered(
        self, client, auth_headers_manager, auth_headers_customer, test_products
    ):
        """Managers should be able to mark orders as delivered (staff permission)"""
        # Create and ship an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Ship it first
        client.post(
            f"/api/admin/orders/{order_id}/ship",
            headers=auth_headers_manager,
            json={
                "courier_name": "Australia Post",
                "tracking_number": "AU987654321",
            },
        )

        # Manager should be able to mark as delivered
        response = client.post(
            f"/api/admin/orders/{order_id}/deliver", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "DELIVERED"

    def test_manager_can_cancel_order(
        self, client, auth_headers_manager, auth_headers_customer, test_products
    ):
        """Managers should be able to cancel orders (staff permission)"""
        # Create an order
        product_id = test_products[0].id
        client.post(
            "/api/cart/items",
            headers=auth_headers_customer,
            json={"product_id": product_id, "quantity": 1},
        )
        checkout_response = client.post(
            "/api/checkout",
            headers=auth_headers_customer,
            json={
                "payment_method": "CREDIT_CARD",
                "shipping_method": "STANDARD",
                "delivery_address": {
                    "street_address": "123 Test St",
                    "suburb": "Testville",
                    "state": "VIC",
                    "postcode": "3000",
                    "country": "Australia",
                },
            },
        )
        order_id = checkout_response.json()["order_id"]

        # Manager should be able to cancel order
        response = client.post(
            f"/api/admin/orders/{order_id}/cancel", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
