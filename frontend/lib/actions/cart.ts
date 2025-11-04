"use server";

import { revalidatePath } from "next/cache";
import { addCartItem as apiAddCartItem } from "@/lib/api/cart";
import { getSessionId, setSessionCookie } from "@/lib/api/server";

export async function addToCart(productId: number, quantity: number = 1) {
  try {
    // Get session ID and ensure it's stored in a cookie for future requests
    const sessionId = await getSessionId();
    await setSessionCookie(sessionId);
    
    await apiAddCartItem({ productId, quantity });
    
    // Revalidate the cart page and any pages that display cart info
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add item to cart" 
    };
  }
}
