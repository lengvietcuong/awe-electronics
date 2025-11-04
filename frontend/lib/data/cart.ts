import "server-only";

import { fetchCart } from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";

export async function getCartItemCount(): Promise<number> {
  try {
    const cart = await fetchCart();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return 0;
    }
    // Log error but don't throw - just return 0 for cart count
    console.error("Failed to fetch cart:", error);
    return 0;
  }
}
