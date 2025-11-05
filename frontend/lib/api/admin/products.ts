import "server-only";

import { apiFetch } from "../server";
import type { ApiProduct } from "../../types/api";

export interface AdjustStockPayload {
  delta: number;
  reason?: string;
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
