import { create } from "zustand";
import { CartItem } from "../types";
import { cartService } from "../services";

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isOpen: boolean; // For cart drawer
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartService.getCart();
      set({
        items: response.data.items || [],
        totalItems: response.data.total_items || 0,
        totalPrice: response.data.total_price || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      // User might not be logged in
    }
  },

  addItem: async (productId: number, quantity = 1) => {
    set({ isLoading: true });
    try {
      await cartService.addItem(productId, quantity);
      // Refetch cart to get full item data with product details
      const cartResponse = await cartService.getCart();
      set({
        items: cartResponse.data.items || [],
        totalItems: cartResponse.data.total_items || 0,
        totalPrice: cartResponse.data.total_price || 0,
        isLoading: false,
        isOpen: true, // Open cart drawer on add
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    // Optimistic update
    const prevItems = get().items;
    const updatedItems = prevItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items: updatedItems });

    try {
      await cartService.updateItem(itemId, quantity);
      // Refetch to get accurate totals
      await get().fetchCart();
    } catch (error) {
      // Revert on error
      set({ items: prevItems });
      throw error;
    }
  },

  removeItem: async (itemId: number) => {
    const prevItems = get().items;
    set({ items: prevItems.filter((item) => item.id !== itemId) });

    try {
      await cartService.removeItem(itemId);
      await get().fetchCart();
    } catch (error) {
      set({ items: prevItems });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await cartService.clearCart();
      set({ items: [], totalItems: 0, totalPrice: 0 });
    } catch (error) {
      throw error;
    }
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));

export default useCartStore;
