"""
Admin Reports router - Sales reports and analytics (manager only)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import io
import csv

from app.database.database import get_db
from app.api_schemas import SalesReportResponse, InventoryReportResponse
from app.services import ReportGenerator
from app.utils.security import get_current_manager
from app.database.models import Account

router = APIRouter()


@router.get("/sales", response_model=SalesReportResponse)
def generate_sales_report(
    start_date: datetime = Query(..., description="Report start date"),
    end_date: datetime = Query(..., description="Report end date"),
    compare_previous: bool = Query(False, description="Compare with previous period"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Generate sales report for specified period (manager only)

    Provides comprehensive sales analytics including:
    - Total sales and order count
    - Average order value
    - Top selling products
    - Sales by category
    - Daily sales trend
    - Optional: Comparison with previous period
    """
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    report = ReportGenerator.generate_sales_report(
        db, start_date, end_date, compare_previous
    )

    return SalesReportResponse(**report)


@router.get("/sales/export")
def export_sales_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Export sales report in JSON or CSV format (manager only)
    """
    report = ReportGenerator.generate_sales_report(db, start_date, end_date, False)

    if format == "json":
        # Return JSON
        return report

    elif format == "csv":
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # Write summary section
        writer.writerow(["Sales Report Summary"])
        writer.writerow(
            ["Period", f"{report['period_start']} to {report['period_end']}"]
        )
        writer.writerow(["Total Sales", report["total_sales"]])
        writer.writerow(["Total Orders", report["total_orders"]])
        writer.writerow(["Average Order Value", report["average_order_value"]])
        writer.writerow([])

        # Write top products
        writer.writerow(["Top Products"])
        writer.writerow(["Product Name", "Category", "Quantity Sold", "Total Revenue"])
        for product in report["top_products"]:
            writer.writerow(
                [
                    product["product_name"],
                    product["category"],
                    product["quantity_sold"],
                    product["total_revenue"],
                ]
            )
        writer.writerow([])

        # Write category breakdown
        writer.writerow(["Sales by Category"])
        writer.writerow(["Category", "Order Count", "Quantity Sold", "Total Revenue"])
        for category in report["sales_by_category"]:
            writer.writerow(
                [
                    category["category"],
                    category["order_count"],
                    category["quantity_sold"],
                    category["total_revenue"],
                ]
            )

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=sales_report_{start_date.date()}_to_{end_date.date()}.csv"
            },
        )


@router.get("/inventory", response_model=InventoryReportResponse)
def generate_inventory_report(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Generate current inventory status report (manager only)

    Provides overview of:
    - Total products
    - Low stock alerts
    - Out of stock products
    - Total inventory value
    - Breakdown by category
    """
    report = ReportGenerator.generate_inventory_report(db)

    return InventoryReportResponse(**report)


@router.get("/inventory/export")
def export_inventory_report(
    format: str = Query("json", regex="^(json|csv)$"),
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Export inventory report in JSON or CSV format (manager only)
    """
    report = ReportGenerator.generate_inventory_report(db)

    if format == "json":
        return report

    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Inventory Report"])
        writer.writerow(["Total Products", report["total_products"]])
        writer.writerow(["Total Inventory Value", report["total_inventory_value"]])
        writer.writerow(["Low Stock Products", report["low_stock_products"]])
        writer.writerow(["Out of Stock Products", report["out_of_stock_products"]])
        writer.writerow([])

        writer.writerow(["Products by Category"])
        writer.writerow(["Category", "Product Count", "Total Stock", "Total Value"])
        for category in report["products_by_category"]:
            writer.writerow(
                [
                    category["category"],
                    category["product_count"],
                    category["total_stock"],
                    category["total_value"],
                ]
            )

        csv_content = output.getvalue()
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=inventory_report.csv"
            },
        )


@router.get("/quick-stats")
def get_quick_stats(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_manager),
):
    """
    Get quick statistics for dashboard (manager only)

    Returns current day, week, month, and year-to-date statistics.
    """
    now = datetime.now()

    # Today
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now
    today_report = ReportGenerator.generate_sales_report(
        db, today_start, today_end, False
    )

    # This week
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_report = ReportGenerator.generate_sales_report(db, week_start, now, False)

    # This month
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_report = ReportGenerator.generate_sales_report(db, month_start, now, False)

    # Year to date
    ytd_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    ytd_report = ReportGenerator.generate_sales_report(db, ytd_start, now, False)

    # Inventory stats
    inventory_report = ReportGenerator.generate_inventory_report(db)

    return {
        "today": {
            "total_sales": today_report["total_sales"],
            "total_orders": today_report["total_orders"],
        },
        "this_week": {
            "total_sales": week_report["total_sales"],
            "total_orders": week_report["total_orders"],
        },
        "this_month": {
            "total_sales": month_report["total_sales"],
            "total_orders": month_report["total_orders"],
            "average_order_value": month_report["average_order_value"],
        },
        "year_to_date": {
            "total_sales": ytd_report["total_sales"],
            "total_orders": ytd_report["total_orders"],
        },
        "inventory": {
            "total_products": inventory_report["total_products"],
            "low_stock_alerts": inventory_report["low_stock_products"],
            "out_of_stock": inventory_report["out_of_stock_products"],
        },
    }
