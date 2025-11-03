"""
Business logic services following the object-oriented design
These are the Controller/Manager classes from the CRC cards
"""

from .customer_account_manager import CustomerAccountManager
from .product_catalogue import ProductCatalogue
from .inventory_manager import InventoryManager
from .shopping_cart_manager import ShoppingCartManager
from .order_processor import OrderProcessor
from .payment_processor import PaymentProcessor
from .product_manager import ProductManager
from .shipment_manager import ShipmentManager
from .order_tracker import OrderTracker
from .sales_analyzer import SalesAnalyzer
from .report_generator import ReportGenerator
from .notification_service import NotificationService

__all__ = [
    "CustomerAccountManager",
    "ProductCatalogue",
    "InventoryManager",
    "ShoppingCartManager",
    "OrderProcessor",
    "PaymentProcessor",
    "ProductManager",
    "ShipmentManager",
    "OrderTracker",
    "SalesAnalyzer",
    "ReportGenerator",
    "NotificationService",
]
