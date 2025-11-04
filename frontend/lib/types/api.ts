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
