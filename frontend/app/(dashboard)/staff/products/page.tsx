import type { Metadata } from "next";

import { ProductManagementClient } from "@/components/staff/products/product-management-client";
import { fetchAdminProducts } from "@/lib/api/admin/products";
import { fetchProductCategories } from "@/lib/api/products";
import { getCurrentUserServer } from "@/lib/api/auth.server";

function getParamValue(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}

function sanitiseSortBy(
  value: string | undefined,
): "created_at" | "updated_at" | "name" | "price" | "stock" | "stock_quantity" | "availability" {
  const allowed = new Set(["created_at", "updated_at", "name", "price", "stock", "stock_quantity", "availability"]);
  if (value && allowed.has(value)) {
    return value as never;
  }
  return "created_at";
}

function sanitiseSortDirection(value: string | undefined): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

export const metadata: Metadata = {
  title: "Product Catalogue",
};

interface ManageProductsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ManageProductsPage({ searchParams = {} }: ManageProductsPageProps) {
  const pageParam = Number(getParamValue(searchParams.page) ?? 1);
  const pageSizeParam = Number(getParamValue(searchParams.page_size) ?? 25);
  const sortBy = sanitiseSortBy(getParamValue(searchParams.sort_by));
  const sortDirection = sanitiseSortDirection(getParamValue(searchParams.sort_direction));

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 100) : 25;

  const queryParams: Record<string, string> = {
    sort_by: sortBy,
    sort_direction: sortDirection,
    page: String(page),
    page_size: String(pageSize),
  };

  const [user, categoriesResponse, productsResponse] = await Promise.all([
    getCurrentUserServer(),
    fetchProductCategories(),
    fetchAdminProducts({
      page,
      pageSize,
      sortBy,
      sortDirection,
    }),
  ]);

  const categorySet = new Set<string>([
    ...categoriesResponse,
    ...productsResponse.products.map((product) => product.category),
  ]);
  const uniqueCategories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  const categories = uniqueCategories.length > 0 ? uniqueCategories : ["General"];

  const canDelete = user.role === "manager";

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Catalogue operations
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Manage products</h1>
        <p className="max-w-2xl text-sm text-slate-700">
          Create, curate, and maintain the AWE Electronics product catalogue. Update details, control visibility, and
          keep inventory levels accurate.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">
          Showing page {productsResponse.page} of {productsResponse.total_pages || 1}. Total matches: {productsResponse.total} products.
        </div>
      </section>

      <ProductManagementClient
        categories={categories}
        productsResponse={productsResponse}
        queryParams={queryParams}
        canDelete={canDelete}
      />
    </div>
  );
}
