"""
Seed database with comprehensive mock data for demonstration
"""

from datetime import datetime, timedelta
import random

from app.database.database import SessionLocal, engine, Base
from app.database.models import (
    Account,
    Customer,
    Employee,
    Product,
    Order,
    OrderItem,
    Payment,
    Receipt,
    Invoice,
    Shipment,
    DeliveryAddress,
    UserRole,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    ShippingMethod,
)
from app.utils.security import get_password_hash


def seed_database():
    """Seed database with comprehensive mock data"""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print(" Starting database seeding...")

        # Check if already seeded
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(
                f"  Database already contains {existing_products} products. Skipping seed."
            )
            return

        # ====================================================================
        # STEP 1: Create Accounts and Users
        # ====================================================================
        print("\n Creating user accounts...")

        # Manager account
        manager_account = Account(
            email="manager@gmail.com",
            hashed_password=get_password_hash("luongtam"),
            role=UserRole.MANAGER,
            is_active=True,
            is_verified=True,
        )
        db.add(manager_account)
        db.flush()

        manager_employee = Employee(
            account_id=manager_account.id,
            first_name="Sarah",
            last_name="Johnson",
            employee_number="EMP001",
        )
        db.add(manager_employee)

        # Staff accounts
        staff_account = Account(
            email="staff@gmail.com",
            hashed_password=get_password_hash("luongtam"),
            role=UserRole.STAFF,
            is_active=True,
            is_verified=True,
        )
        db.add(staff_account)
        db.flush()

        staff_employee = Employee(
            account_id=staff_account.id,
            first_name="John",
            last_name="Smith",
            employee_number="EMP002",
        )
        db.add(staff_employee)

        # Customer accounts
        customer_accounts = []
        customers = []

        customer_data = [
            ("customer@gmail.com", "Default", "Customer", "0400000000"),
            ("john.doe@email.com", "John", "Doe", "0412345678"),
            ("jane.smith@email.com", "Jane", "Smith", "0423456789"),
            ("bob.wilson@email.com", "Bob", "Wilson", "0434567890"),
            ("alice.brown@email.com", "Alice", "Brown", "0445678901"),
            ("charlie.davis@email.com", "Charlie", "Davis", "0456789012"),
        ]

        for email, first_name, last_name, phone in customer_data:
            # Use 'luongtam' for customer@gmail.com, 'password123' for others
            password = "luongtam" if email == "customer@gmail.com" else "password123"
            account = Account(
                email=email,
                hashed_password=get_password_hash(password),
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
            )
            db.add(account)
            db.flush()
            customer_accounts.append(account)

            customer = Customer(
                account_id=account.id,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                email=email,
            )
            db.add(customer)
            db.flush()
            customers.append(customer)

        print(f" Created {len(customers)} customer accounts")

        # ====================================================================
        # STEP 2: Create Delivery Addresses
        # ====================================================================
        print("\n Creating delivery addresses...")

        addresses_data = [
            ("123 Main Street", "Hawthorn", "VIC", "3122"),
            ("456 High Street", "Richmond", "VIC", "3121"),
            ("789 Chapel Street", "Windsor", "VIC", "3181"),
            ("321 Burke Road", "Camberwell", "VIC", "3124"),
            ("654 Glenferrie Road", "Malvern", "VIC", "3144"),
        ]

        delivery_addresses = []
        for i, (street, suburb, state, postcode) in enumerate(addresses_data):
            address = DeliveryAddress(
                customer_id=customers[i].id,
                street_address=street,
                suburb=suburb,
                state=state,
                postcode=postcode,
                country="Australia",
                is_default=True,
            )
            db.add(address)
            db.flush()
            delivery_addresses.append(address)

        print(f" Created {len(delivery_addresses)} delivery addresses")

        # ====================================================================
        # STEP 3: Create Products
        # ====================================================================
        print("\n Creating products...")

        products_data = [
            # Audio Category
            {
                "name": "Sony WH-1000XM5 Wireless Headphones",
                "description": "Industry-leading noise canceling with exceptional sound quality",
                "category": "Audio",
                "brand": "Sony",
                "model_number": "WH1000XM5",
                "price": 549.00,
                "stock_quantity": 45,
                "specifications": "Bluetooth 5.2, 30hr battery, Active Noise Cancellation",
            },
            {
                "name": "Bose QuietComfort 45",
                "description": "Premium wireless noise cancelling headphones",
                "category": "Audio",
                "brand": "Bose",
                "model_number": "QC45",
                "price": 499.00,
                "stock_quantity": 30,
                "specifications": "Bluetooth 5.1, 24hr battery, Acoustic Noise Cancelling",
            },
            {
                "name": "JBL Flip 6 Portable Speaker",
                "description": "Powerful portable Bluetooth speaker with IP67 waterproof",
                "category": "Audio",
                "brand": "JBL",
                "model_number": "FLIP6",
                "price": 179.00,
                "stock_quantity": 60,
                "specifications": "Bluetooth 5.1, 12hr battery, IP67 waterproof",
            },
            # Computing Category
            {
                "name": "Apple MacBook Air M2",
                "description": "13-inch laptop with Apple M2 chip, 8GB RAM, 256GB SSD",
                "category": "Computing",
                "brand": "Apple",
                "model_number": "MBA-M2-256",
                "price": 1899.00,
                "stock_quantity": 20,
                "specifications": "M2 chip, 8GB RAM, 256GB SSD, 13.6-inch Liquid Retina",
            },
            {
                "name": "Dell XPS 13",
                "description": "13.4-inch premium laptop with Intel Core i7",
                "category": "Computing",
                "brand": "Dell",
                "model_number": "XPS13-9320",
                "price": 2199.00,
                "stock_quantity": 15,
                "specifications": "Intel Core i7, 16GB RAM, 512GB SSD, FHD+ Display",
            },
            {
                "name": "Logitech MX Master 3S",
                "description": "Advanced wireless mouse with ergonomic design",
                "category": "Computing",
                "brand": "Logitech",
                "model_number": "MX-MASTER-3S",
                "price": 159.00,
                "stock_quantity": 80,
                "specifications": "Wireless, 8000 DPI, Quiet clicks, Multi-device",
            },
            {
                "name": "Keychron K2 Mechanical Keyboard",
                "description": "Compact wireless mechanical keyboard with hot-swappable switches",
                "category": "Computing",
                "brand": "Keychron",
                "model_number": "K2-V2",
                "price": 139.00,
                "stock_quantity": 50,
                "specifications": "Wireless, Hot-swappable, RGB backlight, 75% layout",
            },
            # Mobile Category
            {
                "name": "Samsung Galaxy S23 Ultra",
                "description": "Premium smartphone with 200MP camera and S Pen",
                "category": "Mobile",
                "brand": "Samsung",
                "model_number": "SM-S918B",
                "price": 1899.00,
                "stock_quantity": 25,
                "specifications": "6.8-inch AMOLED, Snapdragon 8 Gen 2, 12GB RAM, 256GB",
            },
            {
                "name": "iPhone 15 Pro",
                "description": "Apple's flagship smartphone with titanium design",
                "category": "Mobile",
                "brand": "Apple",
                "model_number": "IPHONE15PRO",
                "price": 1849.00,
                "stock_quantity": 30,
                "specifications": "6.1-inch OLED, A17 Pro chip, 128GB, Titanium",
            },
            {
                "name": "Google Pixel 8",
                "description": "Google's AI-powered smartphone with excellent camera",
                "category": "Mobile",
                "brand": "Google",
                "model_number": "PIXEL8",
                "price": 1099.00,
                "stock_quantity": 35,
                "specifications": "6.2-inch OLED, Google Tensor G3, 8GB RAM, 128GB",
            },
            # Home Appliances Category
            {
                "name": "Dyson V15 Detect Vacuum",
                "description": "Cordless vacuum with laser dust detection",
                "category": "Home Appliances",
                "brand": "Dyson",
                "model_number": "V15-DETECT",
                "price": 1299.00,
                "stock_quantity": 18,
                "specifications": "Cordless, Laser detection, 60min runtime, LCD screen",
            },
            {
                "name": "Breville Smart Oven Air Fryer",
                "description": "Countertop oven with 13 cooking functions",
                "category": "Home Appliances",
                "brand": "Breville",
                "model_number": "BOV900BSS",
                "price": 699.00,
                "stock_quantity": 22,
                "specifications": "13 functions, Air fry, Convection, Large capacity",
            },
            {
                "name": "Philips Air Purifier",
                "description": "Smart air purifier with real-time air quality monitoring",
                "category": "Home Appliances",
                "brand": "Philips",
                "model_number": "AC2887",
                "price": 399.00,
                "stock_quantity": 28,
                "specifications": "HEPA filter, Smart sensors, App control, 79m² coverage",
            },
            # Gaming Category
            {
                "name": "PlayStation 5 Console",
                "description": "Next-gen gaming console with ultra-high speed SSD",
                "category": "Gaming",
                "brand": "Sony",
                "model_number": "PS5-DISC",
                "price": 799.00,
                "stock_quantity": 40,
                "specifications": "825GB SSD, 4K 120fps, Ray tracing, DualSense controller",
            },
            {
                "name": "Xbox Series X",
                "description": "Microsoft's most powerful gaming console",
                "category": "Gaming",
                "brand": "Microsoft",
                "model_number": "XBOX-SERIES-X",
                "price": 749.00,
                "stock_quantity": 35,
                "specifications": "1TB SSD, 4K 120fps, Ray tracing, Quick Resume",
            },
            {
                "name": "Nintendo Switch OLED",
                "description": "Hybrid gaming console with vivid OLED screen",
                "category": "Gaming",
                "brand": "Nintendo",
                "model_number": "SWITCH-OLED",
                "price": 539.00,
                "stock_quantity": 45,
                "specifications": "7-inch OLED, 64GB storage, Dock included, Joy-Con",
            },
            {
                "name": "Razer BlackWidow V4 Pro",
                "description": "Premium mechanical gaming keyboard with per-key RGB",
                "category": "Gaming",
                "brand": "Razer",
                "model_number": "BW-V4-PRO",
                "price": 349.00,
                "stock_quantity": 32,
                "specifications": "Mechanical switches, Per-key RGB, Programmable macro keys",
            },
            # Cameras & Photography
            {
                "name": "Canon EOS R6 Mark II",
                "description": "Full-frame mirrorless camera for enthusiasts",
                "category": "Cameras",
                "brand": "Canon",
                "model_number": "EOS-R6-MKII",
                "price": 3899.00,
                "stock_quantity": 12,
                "specifications": "24.2MP Full-frame, 4K 60fps, 40fps burst, IBIS",
            },
            {
                "name": "Sony Alpha a7 IV",
                "description": "Versatile full-frame mirrorless camera",
                "category": "Cameras",
                "brand": "Sony",
                "model_number": "ILCE-7M4",
                "price": 3799.00,
                "stock_quantity": 10,
                "specifications": "33MP Full-frame, 4K 60fps, 10fps burst, 5-axis IBIS",
            },
            {
                "name": "DJI Mini 3 Pro Drone",
                "description": "Compact drone with 4K HDR video",
                "category": "Cameras",
                "brand": "DJI",
                "model_number": "MINI-3-PRO",
                "price": 1199.00,
                "stock_quantity": 24,
                "specifications": "4K 60fps HDR, 34min flight time, Obstacle avoidance",
            },
            # TVs & Displays
            {
                "name": "LG C3 OLED 65-inch TV",
                "description": "Premium OLED TV with stunning picture quality",
                "category": "TVs",
                "brand": "LG",
                "model_number": "OLED65C3PSA",
                "price": 3299.00,
                "stock_quantity": 15,
                "specifications": "65-inch 4K OLED, 120Hz, Dolby Vision, webOS",
            },
            {
                "name": "Samsung 55-inch QLED 4K TV",
                "description": "Quantum dot TV with vibrant colors",
                "category": "TVs",
                "brand": "Samsung",
                "model_number": "QE55Q80C",
                "price": 1799.00,
                "stock_quantity": 20,
                "specifications": "55-inch 4K QLED, 120Hz, HDR10+, Tizen OS",
            },
            {
                "name": "Dell UltraSharp 27 4K Monitor",
                "description": "Professional 4K monitor with USB-C",
                "category": "TVs",
                "brand": "Dell",
                "model_number": "U2723DE",
                "price": 899.00,
                "stock_quantity": 38,
                "specifications": "27-inch 4K IPS, USB-C 90W, 99% sRGB, Height adjustable",
            },
        ]

        products = []
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
            db.flush()
            products.append(product)

        print(
            f" Created {len(products)} products across {len(set(p['category'] for p in products_data))} categories"
        )

        # ====================================================================
        # STEP 4: Create Historical Orders (last 60 days)
        # ====================================================================
        print("\n Creating historical orders...")

        order_count = 0

        # Generate orders for the past 60 days
        for days_ago in range(60, 0, -1):
            # Random number of orders per day (0-3)
            num_orders = random.randint(0, 3)

            for _ in range(num_orders):
                # Random customer
                customer = random.choice(customers)
                address = random.choice(
                    [a for a in delivery_addresses if a.customer_id == customer.id]
                )

                # Random products (1-4 items)
                num_items = random.randint(1, 4)
                order_products = random.sample(products, num_items)

                # Calculate totals
                subtotal = sum(p.price * random.randint(1, 2) for p in order_products)
                tax = subtotal * 0.1
                shipping = 15.0 if subtotal < 100 else 0.0
                total = subtotal + tax + shipping

                # Create order
                order_date = datetime.now() - timedelta(days=days_ago)
                order = Order(
                    order_number=f"AWE{order_date.strftime('%Y%m%d')}{random.randint(100000, 999999)}",
                    customer_id=customer.id,
                    delivery_address_id=address.id,
                    status=(
                        OrderStatus.DELIVERED
                        if days_ago > 7
                        else random.choice(
                            [
                                OrderStatus.DELIVERED,
                                OrderStatus.SHIPPED,
                                OrderStatus.PROCESSING,
                            ]
                        )
                    ),
                    shipping_method=random.choice(
                        [ShippingMethod.STANDARD, ShippingMethod.EXPRESS]
                    ),
                    subtotal=subtotal,
                    shipping_cost=shipping,
                    tax_amount=tax,
                    total_amount=total,
                    created_at=order_date,
                    paid_at=order_date + timedelta(minutes=5),
                    shipped_at=order_date + timedelta(days=1) if days_ago > 3 else None,
                    delivered_at=(
                        order_date + timedelta(days=random.randint(3, 7))
                        if days_ago > 7
                        else None
                    ),
                    estimated_delivery=order_date + timedelta(days=5),
                )
                db.add(order)
                db.flush()

                # Create order items
                for product in order_products:
                    quantity = random.randint(1, 2)
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        product_name=product.name,
                        product_price=product.price,
                        quantity=quantity,
                        line_total=product.price * quantity,
                    )
                    db.add(order_item)

                # Create payment
                payment = Payment(
                    order_id=order.id,
                    payment_method=random.choice(
                        [PaymentMethod.CREDIT_CARD, PaymentMethod.PAYPAL]
                    ),
                    payment_status=PaymentStatus.COMPLETED,
                    amount=total,
                    transaction_id=f"TXN{order_date.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                    created_at=order_date,
                    completed_at=order_date + timedelta(seconds=30),
                )
                db.add(payment)
                db.flush()

                # Create receipt
                receipt = Receipt(
                    payment_id=payment.id,
                    receipt_number=f"REC{order_date.strftime('%Y%m%d%H%M%S')}{random.randint(100, 999)}",
                    issued_at=order_date + timedelta(seconds=30),
                )
                db.add(receipt)

                # Create invoice
                invoice = Invoice(
                    order_id=order.id,
                    invoice_number=f"INV{order.order_number}",
                    issued_at=order_date,
                )
                db.add(invoice)

                # Create shipment if shipped
                if order.shipped_at:
                    shipment = Shipment(
                        order_id=order.id,
                        tracking_number=f"AU{random.randint(100000000000, 999999999999)}",
                        courier_name="Australia Post",
                        packed_at=order_date + timedelta(hours=12),
                        shipped_at=order.shipped_at,
                        delivered_at=order.delivered_at,
                    )
                    db.add(shipment)

                order_count += 1

        print(f" Created {order_count} historical orders")

        # ====================================================================
        # STEP 5: Create some pending orders
        # ====================================================================
        print("\n⏳ Creating pending orders...")

        for i in range(3):
            customer = random.choice(customers)
            address = random.choice(
                [a for a in delivery_addresses if a.customer_id == customer.id]
            )

            # Random products
            num_items = random.randint(1, 3)
            order_products = random.sample(products, num_items)

            subtotal = sum(p.price for p in order_products)
            tax = subtotal * 0.1
            shipping = 15.0 if subtotal < 100 else 0.0
            total = subtotal + tax + shipping

            order_date = datetime.now() - timedelta(hours=random.randint(1, 24))
            order = Order(
                order_number=f"AWE{datetime.now().strftime('%Y%m%d')}{random.randint(100000, 999999)}",
                customer_id=customer.id,
                delivery_address_id=address.id,
                status=OrderStatus.PAID,
                shipping_method=ShippingMethod.STANDARD,
                subtotal=subtotal,
                shipping_cost=shipping,
                tax_amount=tax,
                total_amount=total,
                created_at=order_date,
                paid_at=order_date + timedelta(minutes=5),
                estimated_delivery=datetime.now() + timedelta(days=5),
            )
            db.add(order)
            db.flush()

            for product in order_products:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    product_price=product.price,
                    quantity=1,
                    line_total=product.price,
                )
                db.add(order_item)

            # Payment
            payment = Payment(
                order_id=order.id,
                payment_method=PaymentMethod.CREDIT_CARD,
                payment_status=PaymentStatus.COMPLETED,
                amount=total,
                transaction_id=f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                completed_at=order_date + timedelta(seconds=30),
            )
            db.add(payment)
            db.flush()

            receipt = Receipt(
                payment_id=payment.id,
                receipt_number=f"REC{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100, 999)}",
                issued_at=order_date + timedelta(seconds=30),
            )
            db.add(receipt)

            invoice = Invoice(
                order_id=order.id,
                invoice_number=f"INV{order.order_number}",
                issued_at=order_date,
            )
            db.add(invoice)

        print(" Created 3 pending orders for fulfillment")

        # Commit all changes
        db.commit()

        print("\n Database seeding completed successfully!")
        print("\n Summary:")
        print(f"   - Manager: manager@gmail.com (password: luongtam)")
        print(f"   - Staff: staff@gmail.com (password: luongtam)")
        print(f"   - Customer: customer@gmail.com (password: luongtam)")
        print(
            f"   - Other customers: {len(customers) - 1} accounts (password: password123)"
        )
        print(f"   - Products: {len(products)} across multiple categories")
        print(
            f"   - Orders: {order_count + 3} total ({order_count} historical, 3 pending)"
        )
        print("\n You can now start the application!")

    except Exception as e:
        print(f"\n Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
