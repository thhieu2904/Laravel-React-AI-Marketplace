import api, { ApiResponse } from "./api";
import { Cart, CartItem } from "../types";

export const cartService = {
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await api.get<ApiResponse<Cart>>("/cart");
    return response.data;
  },

  async addItem(productId: number, quantity = 1): Promise<ApiResponse<Cart>> {
    const response = await api.post<ApiResponse<Cart>>("/cart", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateItem(
    itemId: number,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    const response = await api.put<ApiResponse<CartItem>>(`/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(itemId: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/cart/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>("/cart");
    return response.data;
  },
};

export default cartService;
