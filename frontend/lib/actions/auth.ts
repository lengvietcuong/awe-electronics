"use server";

import { setAuthCookie, clearAuthCookie } from "@/lib/auth";

/**
 * Server action to set the authentication token cookie
 * This should be called after successful login
 */
export async function setAuthTokenCookie(token: string) {
  await setAuthCookie(token);
}

/**
 * Server action to clear the authentication token cookie
 * This should be called during logout
 */
export async function clearAuthTokenCookie() {
  await clearAuthCookie();
}
