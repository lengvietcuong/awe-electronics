import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from "./config";
import { ApiError } from "./client";
import type {
  ApiAccountProfile,
  ApiCustomerResponse,
  ApiTokenResponse,
} from "../types/api";
import { getAuthToken } from "../auth-client";

export interface RegisterCustomerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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

export async function registerCustomer(payload: RegisterCustomerPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: {
      ...(DEFAULT_FETCH_OPTIONS.headers ?? {}),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || undefined,
    }),
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiCustomerResponse;
  return data;
}

export async function loginCustomer(payload: LoginPayload) {
  const formData = new URLSearchParams();
  formData.set("username", payload.email);
  formData.set("password", payload.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: {
      ...(DEFAULT_FETCH_OPTIONS.headers ?? {}),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiTokenResponse;
  return data;
}

export async function getCurrentUser() {
  const token = getAuthToken();
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
  });

  if (!response.ok) {
    const errorPayload = await parseErrorPayload(response);
    throw new ApiError(response.status, response.statusText, errorPayload);
  }

  const data = (await response.json()) as ApiAccountProfile;
  return data;
}
