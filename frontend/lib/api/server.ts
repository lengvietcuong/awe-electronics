"use server";

import "server-only";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./config";
import { apiFetch as apiFetchClient, type ApiRequestOptions } from "./client";

export async function getSessionId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  // If no session ID exists, generate a new one but DON'T set the cookie here
  // Cookies can only be set in Server Actions, not during SSR
  // The cookie will be set when a Server Action is called (e.g., addToCart)
  return sessionId ?? randomUUID();
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const sessionId = await getSessionId();
  return apiFetchClient<TResponse>(path, { ...options, sessionId });
}
