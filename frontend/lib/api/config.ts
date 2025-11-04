export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_API_BASE_URL || "http://localhost:8000/api";

export const SESSION_COOKIE_NAME = "awe-session-id";

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};
