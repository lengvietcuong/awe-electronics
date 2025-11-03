from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict
from datetime import datetime

from app.database.models import (
    Product,
    Order,
    OrderItem,
    OrderStatus,
)


class SalesAnalyzer:
    """Performs sales data analysis and calculations"""

    @staticmethod
    def calculate_sales_metrics(
        db: Session, start_date: datetime, end_date: datetime
    ) -> Dict:
        """Calculate sales metrics for period"""
        # Get completed orders in period
        orders = (
            db.query(Order)
            .filter(
                and_(
                    Order.paid_at >= start_date,
                    Order.paid_at <= end_date,
                    Order.status.in_(
                        [
                            OrderStatus.PAID,
                            OrderStatus.PROCESSING,
                            OrderStatus.SHIPPED,
                            OrderStatus.OUT_FOR_DELIVERY,
                            OrderStatus.DELIVERED,
                        ]
                    ),
                )
            )
            .all()
        )

        if not orders:
            return {"total_sales": 0.0, "total_orders": 0, "average_order_value": 0.0}

        total_sales = sum(order.total_amount for order in orders)
        total_orders = len(orders)
        average_order_value = total_sales / total_orders if total_orders > 0 else 0

        return {
            "total_sales": round(total_sales, 2),
            "total_orders": total_orders,
            "average_order_value": round(average_order_value, 2),
        }

    @staticmethod
    def get_top_products(
        db: Session, start_date: datetime, end_date: datetime, limit: int = 10
    ) -> List[Dict]:
        """Get top selling products by revenue"""
        results = (
            db.query(
                Product.id,
                Product.name,
                Product.category,
                func.sum(OrderItem.quantity).label("total_quantity"),
                func.sum(OrderItem.line_total).label("total_revenue"),
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                and_(
                    Order.paid_at >= start_date,
                    Order.paid_at <= end_date,
                    Order.status.in_(
                        [
                            OrderStatus.PAID,
                            OrderStatus.PROCESSING,
                            OrderStatus.SHIPPED,
                            OrderStatus.OUT_FOR_DELIVERY,
                            OrderStatus.DELIVERED,
                        ]
                    ),
                )
            )
            .group_by(Product.id, Product.name, Product.category)
            .order_by(func.sum(OrderItem.line_total).desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "product_id": r.id,
                "product_name": r.name,
                "category": r.category,
                "quantity_sold": r.total_quantity,
                "total_revenue": round(r.total_revenue, 2),
            }
            for r in results
        ]

    @staticmethod
    def get_sales_by_category(
        db: Session, start_date: datetime, end_date: datetime
    ) -> List[Dict]:
        """Get sales breakdown by category"""
        results = (
            db.query(
                Product.category,
                func.count(func.distinct(Order.id)).label("order_count"),
                func.sum(OrderItem.quantity).label("total_quantity"),
                func.sum(OrderItem.line_total).label("total_revenue"),
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                and_(
                    Order.paid_at >= start_date,
                    Order.paid_at <= end_date,
                    Order.status.in_(
                        [
                            OrderStatus.PAID,
                            OrderStatus.PROCESSING,
                            OrderStatus.SHIPPED,
                            OrderStatus.OUT_FOR_DELIVERY,
                            OrderStatus.DELIVERED,
                        ]
                    ),
                )
            )
            .group_by(Product.category)
            .order_by(func.sum(OrderItem.line_total).desc())
            .all()
        )

        return [
            {
                "category": r.category,
                "order_count": r.order_count,
                "quantity_sold": r.total_quantity,
                "total_revenue": round(r.total_revenue, 2),
            }
            for r in results
        ]

    @staticmethod
    def get_daily_sales_trend(
        db: Session, start_date: datetime, end_date: datetime
    ) -> List[Dict]:
        """Get daily sales trend"""
        results = (
            db.query(
                func.date(Order.paid_at).label("date"),
                func.count(Order.id).label("order_count"),
                func.sum(Order.total_amount).label("total_sales"),
            )
            .filter(
                and_(
                    Order.paid_at >= start_date,
                    Order.paid_at <= end_date,
                    Order.status.in_(
                        [
                            OrderStatus.PAID,
                            OrderStatus.PROCESSING,
                            OrderStatus.SHIPPED,
                            OrderStatus.OUT_FOR_DELIVERY,
                            OrderStatus.DELIVERED,
                        ]
                    ),
                )
            )
            .group_by(func.date(Order.paid_at))
            .order_by(func.date(Order.paid_at))
            .all()
        )

        return [
            {
                "date": r.date.isoformat() if r.date else None,
                "order_count": r.order_count,
                "total_sales": round(r.total_sales, 2),
            }
            for r in results
        ]