import "server-only";

import { cookies } from "next/headers";

const AUTH_TOKEN_COOKIE_NAME = "awe-auth-token";

/**
 * Get the authentication token from cookies (server-side)
 */
export async function getAuthTokenServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  console.log("[Auth Server] Token from cookie:", token ? `${token.substring(0, 20)}...` : "null");
  return token ?? null;
}

/**
 * Set the authentication token cookie (server-side)
 * This should be called from a Server Action
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Clear the authentication token cookie (server-side)
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE_NAME);
}
