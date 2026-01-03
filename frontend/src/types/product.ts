// Product Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  is_active: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  specifications?: Record<string, string>;
  original_price: number;
  sale_price?: number;
  current_price: number;
  discount_percent: number;
  stock_quantity: number;
  brand?: string;
  model?: string;
  warranty_months?: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  category?: Category;
  images: ProductImage[];
  average_rating: number;
  reviews_count?: number;
}

export interface Review {
  id: number;
  customer_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  customer?: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    images?: ProductImage[];
  };
}
