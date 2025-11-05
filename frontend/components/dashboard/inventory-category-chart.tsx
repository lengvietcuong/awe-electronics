"use client";

import { useMemo } from "react";

import type { ApiInventoryReportCategory } from "@/lib/types/api";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

interface InventoryCategoryChartProps {
  data: ApiInventoryReportCategory[];
}

const palette = ["#0f766e", "#047857", "#0369a1", "#7c3aed", "#c026d3", "#ea580c"];

export function InventoryCategoryChart({ data }: InventoryCategoryChartProps) {
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => b.total_value - a.total_value).slice(0, 6);
  }, [data]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-700">No inventory categories</p>
        <p>Add product catalog data to visualise stock value across categories.</p>
      </div>
    );
  }

  const totalValue = sorted.reduce((sum, category) => sum + category.total_value, 0) || 1;
  const totalUnits = sorted.reduce((sum, category) => sum + category.total_stock, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Highest value mix</p>
        <p className="text-sm text-slate-500">Top six categories by stock value and unit coverage.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((category, index) => {
          const accent = palette[index % palette.length];
          const valueShare = (category.total_value / totalValue) * 100;
          const unitsShare = (category.total_stock / totalUnits) * 100;

          const outerRadius = 32;
          const outerCircumference = 2 * Math.PI * outerRadius;
          const valueProgress = Math.max(Math.min(valueShare, 100), 2);
          const valueOffset = outerCircumference * (1 - valueProgress / 100);

          const innerRadius = 24;
          const innerCircumference = 2 * Math.PI * innerRadius;
          const unitsProgress = Math.max(Math.min(unitsShare, 100), 4);
          const unitsOffset = innerCircumference * (1 - unitsProgress / 100);

          return (
            <article
              key={category.category}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="absolute inset-x-6 -top-20 h-40 rounded-full bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_70%)]" aria-hidden />
              <div className="relative flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg viewBox="0 0 80 80" className="h-20 w-20" role="presentation" aria-hidden>
                      <circle
                        cx={40}
                        cy={40}
                        r={outerRadius}
                        stroke="rgba(148, 163, 184, 0.25)"
                        strokeWidth={8}
                        fill="none"
                      />
                      <circle
                        cx={40}
                        cy={40}
                        r={outerRadius}
                        stroke={accent}
                        strokeWidth={8}
                        fill="none"
                        strokeDasharray={outerCircumference}
                        strokeDashoffset={valueOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                        style={{ transformOrigin: "40px 40px", transform: "rotate(-90deg)" }}
                      />
                      <circle
                        cx={40}
                        cy={40}
                        r={innerRadius}
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth={5}
                        fill="none"
                      />
                      <circle
                        cx={40}
                        cy={40}
                        r={innerRadius}
                        stroke="rgba(14, 165, 233, 0.85)"
                        strokeWidth={5}
                        fill="none"
                        strokeDasharray={innerCircumference}
                        strokeDashoffset={unitsOffset}
                        strokeLinecap="round"
                        style={{ transformOrigin: "40px 40px", transform: "rotate(-90deg)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 m-auto flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white text-center">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">#{index + 1}</span>
                      <span className="text-sm font-semibold text-slate-900">{formatPercent(valueShare, 0)}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{category.category}</h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Value
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(category.total_value)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(category.product_count)} active products · {formatNumber(category.total_stock)} units on hand
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-[0.25em]">
                  <span className="flex items-center gap-2 text-emerald-600">
                    <span
                      className="h-1.5 w-4 rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    />
                    Value share {formatPercent(valueShare, 1)}
                  </span>
                  <span className="flex items-center gap-2 text-sky-600">
                    <span className="h-1.5 w-4 rounded-full bg-sky-400" aria-hidden />
                    Units share {formatPercent(unitsShare, 1)}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="space-y-1">
                    <dt className="uppercase tracking-[0.2em] text-slate-400">Unit value</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCurrency(category.total_value / Math.max(category.total_stock, 1))}/unit
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="uppercase tracking-[0.2em] text-slate-400">SKU coverage</dt>
                    <dd className="font-medium text-slate-900">
                      {formatNumber(category.product_count)} SKUs
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default InventoryCategoryChart;
