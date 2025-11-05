"""Tests for reports endpoints (manager only)"""

from fastapi import status
from datetime import datetime, timedelta


class TestReports:
    """Test reporting functionality"""

    def test_quick_stats(self, client, auth_headers_manager):
        """Test getting quick dashboard stats"""
        response = client.get("/api/admin/reports/quick-stats", headers=auth_headers_manager)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "today" in data
        assert "this_week" in data
        assert "this_month" in data
        assert "year_to_date" in data

    def test_quick_stats_unauthorized(self, client, auth_headers_customer):
        """Test quick stats with customer role (should fail)"""
        response = client.get("/api/admin/reports/quick-stats", headers=auth_headers_customer)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_sales_report_default(self, client, auth_headers_manager):
        """Test sales report with default parameters"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        response = client.get(
            f"/api/admin/reports/sales?start_date={start_date.date()}&end_date={end_date.date()}",
            headers=auth_headers_manager,
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "period" in data
        assert "total_sales" in data
        assert "total_orders" in data

    def test_sales_report_custom_period(self, client, auth_headers_manager):
        """Test sales report with custom date range"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        response = client.get(
            f"/api/admin/reports/sales?start_date={start_date.date()}&end_date={end_date.date()}",
            headers=auth_headers_manager,
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "period" in data
        assert start_date.date().isoformat() in data["period"]["start_date"]

    def test_sales_report_with_comparison(self, client, auth_headers_manager):
        """Test sales report with period comparison"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        response = client.get(
            f"/api/admin/reports/sales?start_date={start_date.date()}&end_date={end_date.date()}&compare_previous=true",
            headers=auth_headers_manager,
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "period" in data

    def test_inventory_report(self, client, auth_headers_manager):
        """Test inventory report"""
        response = client.get("/api/admin/reports/inventory", headers=auth_headers_manager)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_products" in data
        assert "total_inventory_value" in data
        assert "products_by_category" in data
        assert isinstance(data["products_by_category"], list)

    def test_inventory_report_low_stock_only(
        self, client, auth_headers_manager, test_products
    ):
        """Test inventory report filtered for low stock"""
        response = client.get(
            "/api/admin/reports/inventory?low_stock_only=true", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "products_by_category" in data
        assert "low_stock_products" in data

    def test_inventory_report_by_category(self, client, auth_headers_manager):
        """Test inventory report filtered by category"""
        response = client.get(
            "/api/admin/reports/inventory?category=Computing", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "products_by_category" in data
        assert "total_products" in data

    def test_export_sales_report_csv(self, client, auth_headers_manager):
        """Test exporting sales report as CSV"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        response = client.get(
            f"/api/admin/reports/sales/export?format=csv&start_date={start_date.date()}&end_date={end_date.date()}",
            headers=auth_headers_manager,
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers["content-disposition"]

    def test_export_inventory_report_csv(self, client, auth_headers_manager):
        """Test exporting inventory report as CSV"""
        response = client.get(
            "/api/admin/reports/inventory/export?format=csv", headers=auth_headers_manager
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "text/csv; charset=utf-8"

    def test_reports_forbidden_for_staff(self, client, auth_headers_staff):
        """Test that staff cannot access reports"""
        response = client.get("/api/admin/reports/sales", headers=auth_headers_staff)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reports_unauthorized(self, client):
        """Test reports without authentication"""
        response = client.get("/api/admin/reports/sales")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
