import { API_BASE_URL, DEFAULT_FETCH_OPTIONS, SESSION_COOKIE_NAME } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
  revalidate?: number | false;
  sessionId?: string;
}

export class ApiError extends Error {
  constructor(public status: number, public statusText: string, public payload: unknown) {
    super(`API error ${status}: ${statusText}`);
  }
}

function buildQueryString(query?: ApiRequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.sessionId) {
    headers.set("X-Session-ID", options.sessionId);
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const queryString = buildQueryString(options.query);

  const response = await fetch(`${API_BASE_URL}${path}${queryString}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: options.method ?? "GET",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    headers,
    cache: options.cache ?? DEFAULT_FETCH_OPTIONS.cache,
    next:
      typeof options.revalidate === "number"
        ? { revalidate: options.revalidate }
        : options.revalidate === false
          ? { revalidate: 0 }
          : undefined,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }

    throw new ApiError(response.status, response.statusText, payload);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}
