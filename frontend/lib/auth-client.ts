/**
 * Client-side authentication utilities
 * Handles JWT token storage and retrieval
 */

export const AUTH_TOKEN_STORAGE_KEY = "awe-auth-token";

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
