import "server-only";

import { apiFetch } from "../server";
import type { ApiOrderResponse } from "../../types/api";

export interface ShipOrderPayload {
  tracking_number?: string;
  courier_name?: string;
  packing_notes?: string;
}

export async function fetchPendingOrders() {
  return apiFetch<ApiOrderResponse[]>("/admin/orders/pending", {
    cache: "no-store",
  });
}

export async function shipOrder(orderId: number, payload: ShipOrderPayload) {
  return apiFetch<ApiOrderResponse>(`/admin/orders/${orderId}/ship`, {
    method: "POST",
    body: payload,
    cache: "no-store",
  });
}

export async function markOrderDelivered(orderId: number) {
  return apiFetch<ApiOrderResponse>(`/admin/orders/${orderId}/deliver`, {
    method: "POST",
    cache: "no-store",
  });
}

export async function deleteOrder(orderId: number) {
  return apiFetch<{ message: string }>(`/admin/orders/${orderId}`, {
    method: "DELETE",
    cache: "no-store",
  });
}
