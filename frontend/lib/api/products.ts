import "server-only";

import { apiFetch } from "./server";
import type { ApiProduct, ApiProductListResponse } from "../types/api";

export interface FetchProductsParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export async function fetchProducts(params: FetchProductsParams = {}) {
  return apiFetch<ApiProductListResponse>("/products", {
    query: {
      category: params.category,
      search: params.search,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      page: params.page,
      page_size: params.pageSize,
    },
  });
}

export async function fetchProductById(productId: number) {
  return apiFetch<ApiProduct>(`/products/${productId}`);
}

export async function fetchProductCategories() {
  const response = await apiFetch<{ categories: string[] }>("/products/categories");
  return response.categories;
}
