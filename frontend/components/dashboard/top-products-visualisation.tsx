"use client";

import { useMemo } from "react";

import type {
  ApiSalesReportCategory,
  ApiSalesReportProduct,
} from "@/lib/types/api";
import { formatCurrency, formatNumber } from "@/lib/formatters";

interface TopProductsVisualisationProps {
  products: ApiSalesReportProduct[];
  categories: ApiSalesReportCategory[];
}

export function TopProductsVisualisation({
  products,
  categories,
}: TopProductsVisualisationProps) {
  const topProducts = useMemo(() => {
    return [...products].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
  }, [products]);

  const topCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
  }, [categories]);

  const totalProductRevenue = useMemo(() => {
    return products.reduce((sum, product) => sum + product.total_revenue, 0);
  }, [products]);

  const totalCategoryRevenue = useMemo(() => {
    return categories.reduce((sum, category) => sum + category.total_revenue, 0);
  }, [categories]);

  if (topProducts.length === 0 && topCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <p className="text-sm font-semibold text-slate-700">Waiting on sales data</p>
        <p className="max-w-sm text-xs text-slate-500">
          Once orders start flowing in, this section will highlight the strongest products and
          categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Top products
          </p>
          <p className="text-sm text-slate-500">Ranked by revenue.</p>
        </div>

        {topProducts.length === 0 ? (
          <EmptyState message="No products have recorded sales yet." />
        ) : (
          <ul className="space-y-3">
            {topProducts.map((product, index) => {
              const shareWidth = totalProductRevenue
                ? Math.max((product.total_revenue / totalProductRevenue) * 100, 8)
                : 0;

              return (
                <li
                  key={product.product_id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{product.product_name}</p>
                        <p className="text-xs text-slate-500">
                          {product.category} · SKU #{product.product_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(product.total_revenue)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatNumber(product.quantity_sold)} units
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${shareWidth}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Top categories
          </p>
          <p className="text-sm text-slate-500">Revenue and units by category.</p>
        </div>

        {topCategories.length === 0 ? (
          <EmptyState message="No categories have reported sales yet." />
        ) : (
          <ul className="space-y-3">
            {topCategories.map((category, index) => {
              const shareWidth = totalCategoryRevenue
                ? Math.max((category.total_revenue / totalCategoryRevenue) * 100, 8)
                : 0;

              return (
                <li
                  key={category.category}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{category.category}</p>
                        <p className="text-xs text-slate-500">
                          {formatNumber(category.order_count)} orders · {formatNumber(category.quantity_sold)} units
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(category.total_revenue)}
                      </p>
                      <p className="text-xs text-slate-500">Revenue</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sky-500 to-sky-400"
                      style={{ width: `${shareWidth}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-xs text-slate-500">
      {message}
    </div>
  );
}

export default TopProductsVisualisation;
