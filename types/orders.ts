import type { OrderStatus, OrderPaymentStatus } from "@/lib/validation/order-schema";

export type { OrderStatus, OrderPaymentStatus };

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  product_price_snapshot: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  customer_notes: string | null;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  payment_method: string;
  subtotal: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface PublicOrderReceipt {
  reference: string;
  customer_name: string;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  payment_method: string;
  total: number;
  currency: string;
  created_at: string;
  items: Array<{
    product_name_snapshot: string;
    product_price_snapshot: number;
    quantity: number;
    subtotal: number;
  }>;
}

export interface PublicOrderTracking extends PublicOrderReceipt {
  shipping_address: string;
}

export type OrderActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: "NOT_FOUND" | "INSUFFICIENT_STOCK" | "VALIDATION_ERROR";
      fieldErrors?: Record<string, string[]>;
    };
