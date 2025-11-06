import "server-only";

import { apiFetch } from "../server";
import type { ApiProduct, ApiProductListResponse } from "../../types/api";

export interface AdjustStockPayload {
  delta: number;
  reason?: string;
}

export interface AdminProductFilters {
  search?: string;
  category?: string;
  status?: "active" | "inactive" | "discontinued";
  availability?: "in_stock" | "out_of_stock" | "low_stock";
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "updated_at" | "name" | "price" | "stock" | "stock_quantity" | "availability";
  sortDirection?: "asc" | "desc";
}

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  category: string;
  brand?: string | null;
  model_number?: string | null;
  specifications?: string | null;
  price: number;
  stock_quantity?: number;
  image_url?: string | null;
  low_stock_threshold?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  is_active?: boolean;
};

export async function fetchAdminProducts(filters: AdminProductFilters = {}) {
  return apiFetch<ApiProductListResponse>("/admin/products", {
    cache: "no-store",
    query: {
      search: filters.search,
      category: filters.category,
      status: filters.status,
      availability: filters.availability,
      page: filters.page,
      page_size: filters.pageSize,
      sort_by: filters.sortBy,
      sort_direction: filters.sortDirection,
    },
  });
}

export async function fetchAdminProduct(productId: number) {
  return apiFetch<ApiProduct>(`/admin/products/${productId}`, {
    cache: "no-store",
  });
}

export async function createProduct(payload: CreateProductPayload) {
  return apiFetch<ApiProduct>("/admin/products", {
    method: "POST",
    body: payload,
    cache: "no-store",
  });
}

export async function updateProduct(productId: number, payload: UpdateProductPayload) {
  return apiFetch<ApiProduct>(`/admin/products/${productId}`, {
    method: "PUT",
    body: payload,
    cache: "no-store",
  });
}

export async function deleteProduct(productId: number) {
  return apiFetch<void>(`/admin/products/${productId}`, {
    method: "DELETE",
    cache: "no-store",
  });
}

export async function fetchLowStockProducts(threshold?: number) {
  return apiFetch<ApiProduct[]>("/admin/products/low-stock", {
    cache: "no-store",
    query: {
      threshold,
    },
  });
}

export async function adjustProductStock(
  productId: number,
  payload: AdjustStockPayload,
) {
  return apiFetch<ApiProduct>(`/admin/products/${productId}/stock`, {
    method: "PATCH",
    body: payload,
    cache: "no-store",
  });
}
