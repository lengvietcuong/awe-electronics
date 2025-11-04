import "server-only";

import { apiFetch } from "./server";
import type { ApiOrderTrackingResponse } from "../types/api";

export async function fetchTracking(orderNumber: string, email: string) {
  return apiFetch<ApiOrderTrackingResponse>("/tracking", {
    query: {
      order_number: orderNumber,
      email,
    },
  });
}
