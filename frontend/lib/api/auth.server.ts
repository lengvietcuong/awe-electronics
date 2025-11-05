import "server-only";

import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from "./config";
import { ApiError } from "./client";
import type { ApiAccountProfile } from "../types/api";
import { getAuthTokenServer } from "../auth";

async function parseErrorPayload(response: Response) {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

/**
 * Server-side version of getCurrentUser that reads token from cookies
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUserServer() {
  const token = await getAuthTokenServer();
  if (!token) {
    throw new ApiError(401, "Unauthorized", { detail: "No authentication token found" });
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
    headers: {
      ...(DEFAULT_FETCH_OPTIONS.headers ?? {}),
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Don't cache user data on the server
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiAccountProfile;
  return data;
}
