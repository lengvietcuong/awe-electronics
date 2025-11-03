from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict
from datetime import datetime
from app.services.sales_analyzer import SalesAnalyzer

from app.database.models import (
    Product,
)


class ReportGenerator:
    """Creates various business reports for management"""

    @staticmethod
    def generate_sales_report(
        db: Session,
        start_date: datetime,
        end_date: datetime,
        compare_previous_period: bool = False,
    ) -> Dict:
        """Generate comprehensive sales report"""
        # Current period metrics
        current_metrics = SalesAnalyzer.calculate_sales_metrics(
            db, start_date, end_date
        )
        top_products = SalesAnalyzer.get_top_products(
            db, start_date, end_date, limit=10
        )
        category_sales = SalesAnalyzer.get_sales_by_category(db, start_date, end_date)
        daily_trend = SalesAnalyzer.get_daily_sales_trend(db, start_date, end_date)

        report = {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            },
            "total_sales": current_metrics["total_sales"],
            "total_orders": current_metrics["total_orders"],
            "average_order_value": current_metrics["average_order_value"],
            "top_products": top_products,
            "sales_by_category": category_sales,
            "daily_trend": daily_trend,
        }

        # Comparison with previous period
        if compare_previous_period:
            period_length = end_date - start_date
            prev_start = start_date - period_length
            prev_end = start_date

            prev_metrics = SalesAnalyzer.calculate_sales_metrics(
                db, prev_start, prev_end
            )

            # Calculate percentage changes
            sales_change = (
                (
                    (current_metrics["total_sales"] - prev_metrics["total_sales"])
                    / prev_metrics["total_sales"]
                    * 100
                )
                if prev_metrics["total_sales"] > 0
                else 0
            )

            orders_change = (
                (
                    (current_metrics["total_orders"] - prev_metrics["total_orders"])
                    / prev_metrics["total_orders"]
                    * 100
                )
                if prev_metrics["total_orders"] > 0
                else 0
            )

            aov_change = (
                (
                    (
                        current_metrics["average_order_value"]
                        - prev_metrics["average_order_value"]
                    )
                    / prev_metrics["average_order_value"]
                    * 100
                )
                if prev_metrics["average_order_value"] > 0
                else 0
            )

            report["comparison"] = {
                "previous_period_start": prev_start.isoformat(),
                "previous_period_end": prev_end.isoformat(),
                "previous_total_sales": prev_metrics["total_sales"],
                "previous_total_orders": prev_metrics["total_orders"],
                "previous_average_order_value": prev_metrics["average_order_value"],
                "sales_change_percent": round(sales_change, 2),
                "orders_change_percent": round(orders_change, 2),
                "aov_change_percent": round(aov_change, 2),
            }

        return report

    @staticmethod
    def generate_inventory_report(db: Session) -> Dict:
        """Generate inventory status report"""
        # Total products
        total_products = db.query(Product).filter(Product.is_active == True).count()

        # Low stock products
        low_stock = (
            db.query(Product)
            .filter(
                and_(
                    Product.is_active == True,
                    (Product.stock_quantity - Product.reserved_quantity)
                    <= Product.low_stock_threshold,
                )
            )
            .count()
        )

        # Out of stock
        out_of_stock = (
            db.query(Product)
            .filter(
                and_(
                    Product.is_active == True,
                    (Product.stock_quantity - Product.reserved_quantity) <= 0,
                )
            )
            .count()
        )

        # Total inventory value
        products = db.query(Product).filter(Product.is_active == True).all()
        total_value = sum(p.price * p.stock_quantity for p in products)

        # Products by category
        category_counts = (
            db.query(
                Product.category,
                func.count(Product.id).label("count"),
                func.sum(Product.stock_quantity).label("total_stock"),
                func.sum(Product.price * Product.stock_quantity).label("value"),
            )
            .filter(Product.is_active == True)
            .group_by(Product.category)
            .all()
        )

        return {
            "total_products": total_products,
            "low_stock_products": low_stock,
            "out_of_stock_products": out_of_stock,
            "total_inventory_value": round(total_value, 2),
            "products_by_category": [
                {
                    "category": c.category,
                    "product_count": c.count,
                    "total_stock": c.total_stock,
                    "total_value": round(c.value, 2),
                }
                for c in category_counts
            ],
        }
