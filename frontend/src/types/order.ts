// Order Types
import type { Product } from "./product";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  price: number; // unit price
  unit_price: number;
  quantity: number;
  total_price: number;
  product?: Product; // populated in detail view
}

export interface Order {
  id: number;
  customer_id: number;
  order_code: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: "cod" | "online";
  payment_status: "pending" | "paid" | "failed";
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};
