export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  model_number: string | null;
  specifications: string | null;
  price: number;
  stock_quantity: number;
  available_quantity: number;
  is_available: boolean;
  is_low_stock: boolean;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  is_discontinued: boolean;
  created_at: string;
}

export interface ApiProductListResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiCartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
}

export interface ApiCartResponse {
  id: number;
  items: ApiCartItem[];
  subtotal: number;
  estimated_tax: number;
  estimated_shipping: number;
  estimated_total: number;
}

export interface ApiCustomerResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: string;
  created_at: string;
}

export interface ApiAccountProfile {
  id: number;
  email: string;
  role: "customer" | "staff" | "manager";
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  employee_number?: string | null;
  created_at: string;
}

export interface ApiTokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiCheckoutRequest {
  delivery_address_id?: number;
  delivery_address?: {
    street_address: string;
    suburb: string;
    state: string;
    postcode: string;
    country?: string;
    is_default?: boolean;
  };
  shipping_method: "STANDARD" | "EXPRESS";
  payment_method: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER";
  guest_email?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_phone?: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  paypal_email?: string;
}

export interface ApiCheckoutResponse {
  order_id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string | null;
}

export interface ApiOrderTrackingEvent {
  status: string;
  timestamp?: string;
  description?: string;
  location?: string;
}

export interface ApiOrderTrackingResponse {
  order_number: string;
  status: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  status_history: ApiOrderTrackingEvent[];
}

export interface ApiOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ApiDeliveryAddress {
  id: number;
  street_address: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
}

export interface ApiOrderResponse {
  id: number;
  order_number: string;
  customer_id: number;
  status: string;
  shipping_method: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ApiOrderItem[];
  delivery_address: ApiDeliveryAddress;
}

export interface ApiOrderListResponse {
  orders: ApiOrderResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiSalesReportProduct {
  product_id: number;
  product_name: string;
  category: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface ApiSalesReportCategory {
  category: string;
  order_count: number;
  quantity_sold: number;
  total_revenue: number;
}

export interface ApiSalesReportDailyTrend {
  date: string | null;
  order_count: number;
  total_sales: number;
}

export interface ApiSalesReport {
  period_start: string;
  period_end: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_products: ApiSalesReportProduct[];
  sales_by_category: ApiSalesReportCategory[];
  daily_trend: ApiSalesReportDailyTrend[];
  comparison?: {
    previous_period_start: string;
    previous_period_end: string;
    previous_total_sales: number;
    previous_total_orders: number;
    previous_average_order_value: number;
    sales_change_percent: number;
    orders_change_percent: number;
    aov_change_percent: number;
  };
}

export interface ApiInventoryReportCategory {
  category: string;
  product_count: number;
  total_stock: number;
  total_value: number;
}

export interface ApiInventoryReport {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_inventory_value: number;
  products_by_category: ApiInventoryReportCategory[];
}

export interface ApiQuickStats {
  today: {
    total_sales: number;
    total_orders: number;
  };
  this_week: {
    total_sales: number;
    total_orders: number;
  };
  this_month: {
    total_sales: number;
    total_orders: number;
    average_order_value: number;
  };
  year_to_date: {
    total_sales: number;
    total_orders: number;
  };
  inventory: {
    total_products: number;
    low_stock_alerts: number;
    out_of_stock: number;
  };
}
