"use server";

import "server-only";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";

import { SESSION_COOKIE_NAME } from "./config";
import { apiFetch as apiFetchClient, type ApiRequestOptions } from "./client";

export async function ensureSessionId() {
  const cookieStore = cookies() as unknown as ResponseCookies;
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionId;
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const sessionId = await ensureSessionId();
  return apiFetchClient<TResponse>(path, { ...options, sessionId });
}
