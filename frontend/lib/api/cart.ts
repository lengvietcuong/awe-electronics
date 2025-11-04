import "server-only";

import { apiFetch } from "./server";
import type { ApiCartItem, ApiCartResponse } from "../types/api";

export async function fetchCart() {
  return apiFetch<ApiCartResponse>("/cart");
}

export interface AddCartItemPayload {
  productId: number;
  quantity: number;
}

export async function addCartItem(payload: AddCartItemPayload) {
  return apiFetch<ApiCartItem>("/cart/items", {
    method: "POST",
    body: {
      product_id: payload.productId,
      quantity: payload.quantity,
    },
  });
}

export interface UpdateCartItemPayload {
  itemId: number;
  quantity: number;
}

export async function updateCartItem(payload: UpdateCartItemPayload) {
  return apiFetch<ApiCartItem | null>(`/cart/items/${payload.itemId}`, {
    method: "PATCH",
    body: {
      quantity: payload.quantity,
    },
  });
}

export async function removeCartItem(itemId: number) {
  await apiFetch<void>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  await apiFetch<void>("/cart", {
    method: "DELETE",
  });
}
