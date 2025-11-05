/**
 * Client-side authentication utilities
 * Handles JWT token and profile storage/retrieval
 */

import type { ApiAccountProfile } from "./types/api";

export const AUTH_TOKEN_STORAGE_KEY = "awe-auth-token";
export const AUTH_PROFILE_STORAGE_KEY = "awe-account-profile";

/**
 * Get the current authentication token from localStorage
 * Only works in client components (browser environment)
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

/**
 * Remove the authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

function parseProfile(rawValue: string | null): ApiAccountProfile | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ApiAccountProfile;
    return parsed;
  } catch (error) {
    console.warn("Failed to parse stored account profile", error);
    return null;
  }
}

export function getStoredAccountProfile(): ApiAccountProfile | null {
  if (typeof window === "undefined") {
    return null;
  }
  const rawValue = window.localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
  return parseProfile(rawValue);
}

export function setStoredAccountProfile(profile: ApiAccountProfile): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    AUTH_PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
}

export function clearStoredAccountProfile(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
}
