import api, { ApiResponse } from "./api";
import { Product, Category } from "../types";

export interface ProductFilters {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  per_page?: number;
}

export const productService = {
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>("/public/products", {
      params: filters,
    });
    return response.data;
  },

  async getFeaturedProducts(limit = 8): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>(
      "/public/products/featured",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(
      `/public/products/${slug}`
    );
    return response.data;
  },

  async getRelatedProducts(
    productId: number,
    limit = 4
  ): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>(
      `/public/products/${productId}/related`,
      {
        params: { limit },
      }
    );
    return response.data;
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>(
      "/public/categories"
    );
    return response.data;
  },

  async getCategoryBySlug(
    slug: string
  ): Promise<ApiResponse<Category & { products: Product[] }>> {
    const response = await api.get<
      ApiResponse<Category & { products: Product[] }>
    >(`/public/categories/${slug}`);
    return response.data;
  },
};

export default productService;
