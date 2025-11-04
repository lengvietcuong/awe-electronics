import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from "./config";
import { ApiError } from "./client";
import type { ApiOrderResponse, ApiOrderListResponse } from "../types/api";
import { getAuthToken } from "../auth-client";

export interface FetchOrdersParams {
  page?: number;
  pageSize?: number;
}

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

export async function fetchOrders(params?: FetchOrdersParams) {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(401, "Unauthorized", { detail: "No authentication token found" });
  }

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));

  const url = `${API_BASE_URL}/orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
    headers: {
      ...(DEFAULT_FETCH_OPTIONS.headers ?? {}),
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiOrderListResponse;
  return data;
}

export async function fetchOrderById(orderId: number) {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError(401, "Unauthorized", { detail: "No authentication token found" });
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
    headers: {
      ...(DEFAULT_FETCH_OPTIONS.headers ?? {}),
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiOrderResponse;
  return data;
}
