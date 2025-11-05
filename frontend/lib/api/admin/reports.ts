import "server-only";

import { apiFetch } from "../server";
import type {
  ApiInventoryReport,
  ApiQuickStats,
  ApiSalesReport,
} from "../../types/api";

export async function fetchQuickStats() {
  return apiFetch<ApiQuickStats>("/admin/reports/quick-stats", {
    cache: "no-store",
  });
}

export interface FetchSalesReportParams {
  startDate: string;
  endDate: string;
  comparePrevious?: boolean;
}

export async function fetchSalesReport(params: FetchSalesReportParams) {
  return apiFetch<ApiSalesReport>("/admin/reports/sales", {
    cache: "no-store",
    query: {
      start_date: params.startDate,
      end_date: params.endDate,
      compare_previous: params.comparePrevious ?? false,
    },
  });
}

export async function fetchInventoryReport() {
  return apiFetch<ApiInventoryReport>("/admin/reports/inventory", {
    cache: "no-store",
  });
}
