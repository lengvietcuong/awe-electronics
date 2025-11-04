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
