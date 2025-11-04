"use server";

import "server-only";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./config";
import { apiFetch as apiFetchClient, type ApiRequestOptions } from "./client";

export async function getSessionId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  // If no session ID exists, generate a new one
  // Note: We can't set it here as cookies can only be modified in Server Actions or Route Handlers
  // The backend should handle session creation and set the cookie in the response
  return sessionId ?? randomUUID();
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const sessionId = await getSessionId();
  return apiFetchClient<TResponse>(path, { ...options, sessionId });
}
