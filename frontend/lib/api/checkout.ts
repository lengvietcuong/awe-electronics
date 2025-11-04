import "server-only";

import { apiFetch } from "./server";
import type { ApiCheckoutRequest, ApiCheckoutResponse } from "../types/api";

export async function submitCheckout(payload: ApiCheckoutRequest) {
  return apiFetch<ApiCheckoutResponse>("/checkout", {
    method: "POST",
    body: payload,
  });
}
