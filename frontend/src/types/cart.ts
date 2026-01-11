// Cart Types
export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  original_price: number;
  sale_price?: number;
  current_price: number;
  stock_quantity: number;
  image?: string;
}

export interface CartItem {
  id: number;
  cart_id?: number;
  product_id: number;
  quantity: number;
  product: CartProduct;
  subtotal: number;
}

export interface Cart {
  id: number;
  customer_id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}
