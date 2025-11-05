import { redirect } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  LineChart,
  PackageSearch,
  ShoppingBag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { getCurrentUserServer } from "@/lib/api/auth.server";
import { fetchSalesReport } from "@/lib/api/admin/reports";
import type { ApiSalesReport } from "@/lib/types/api";
import { ApiError } from "@/lib/api/client";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { TimeRangeSelect } from "@/components/dashboard/time-range-select";
import { TopProductsVisualisation } from "@/components/dashboard/top-products-visualisation";

export const dynamic = "force-dynamic";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 365 days" },
  { value: "all", label: "All time" },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

function describeError(error: unknown) {
  if (error instanceof ApiError) {
    const payload = error.payload as { detail?: string } | null;
    if (payload && typeof payload.detail === "string") {
      return payload.detail;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while loading data.";
}

function resolvePeriod(range: RangeValue) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const end = new Date(now);
  const start = new Date(now);

  switch (range) {
    case "today":
      break;
    case "7d":
      start.setDate(end.getDate() - 6);
      break;
    case "30d":
      start.setDate(end.getDate() - 29);
      break;
    case "90d":
      start.setDate(end.getDate() - 89);
      break;
    case "365d":
      start.setDate(end.getDate() - 364);
      break;
    case "all":
      start.setFullYear(end.getFullYear() - 10);
      start.setMonth(0, 1);
      break;
    default:
      start.setDate(end.getDate() - 29);
      break;
  }

  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  return { startDate, endDate };
}

function ChangeBadge({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
        —
      </span>
    );
  }

  const rounded = Number.parseFloat(value.toFixed(1));
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : LineChart;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        isPositive
          ? "bg-emerald-500/10 text-emerald-400"
          : isNegative
            ? "bg-amber-500/10 text-amber-400"
            : "border border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {`${isPositive ? "+" : ""}${rounded.toFixed(1)}%`}
    </span>
  );
}

function getRangeValue(param?: string): RangeValue {
  if (RANGE_OPTIONS.some((option) => option.value === param)) {
    return param as RangeValue;
  }
  return "30d";
}

export default async function ManagerPage(props: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUserServer();
  if (user.role !== "manager") {
    redirect("/staff");
  }

  const searchParams = await props.searchParams;
  const range = getRangeValue(searchParams?.range);
  const period = resolvePeriod(range);

  const [salesReportResult] = await Promise.allSettled([
    fetchSalesReport({ ...period, comparePrevious: true }),
  ]);

  let salesReport: ApiSalesReport | null = null;

  let salesReportError: string | null = null;

  if (salesReportResult.status === "fulfilled") {
    salesReport = salesReportResult.value;
  } else {
    salesReportError = describeError(salesReportResult.reason);
  }

  const greetingName = user.first_name || user.email;

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Performance console
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {greetingName}
            </h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Track sales momentum, spot growth opportunities, and stay aligned with your leadership goals for the selected time range.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              Time range
            </p>
            <TimeRangeSelect options={RANGE_OPTIONS} value={range} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total revenue"
          icon={TrendingUp}
          value={salesReport ? formatCurrency(salesReport.total_sales) : "—"}
          description={salesReport ? `${formatNumber(salesReport.total_orders)} orders` : salesReportError ?? "Loading…"}
          change={salesReport?.comparison?.sales_change_percent}
        />
        <MetricCard
          title="Total orders"
          icon={ShoppingBag}
          value={salesReport ? formatNumber(salesReport.total_orders) : "—"}
          description={salesReport ? `Avg value ${formatCurrency(salesReport.average_order_value)}` : salesReportError ?? "Loading…"}
          change={salesReport?.comparison?.orders_change_percent}
        />
        <MetricCard
          title="Average order"
          icon={LineChart}
          value={salesReport ? formatCurrency(salesReport.average_order_value) : "—"}
          description={salesReport ? `Revenue / order` : salesReportError ?? "Loading…"}
          change={salesReport?.comparison?.aov_change_percent}
        />
        <MetricCard
          title="Total units"
          icon={PackageSearch}
          value={salesReport ? formatNumber(getTotalUnits(salesReport)) : "—"}
          description={salesReport ? `Across ${formatNumber(getUniqueSkus(salesReport))} SKUs` : salesReportError ?? "Loading…"}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Sales performance</h2>
            <p className="text-sm text-slate-600">
              {salesReport
                ? `${formatDate(new Date(salesReport.period.start_date))} → ${formatDate(new Date(salesReport.period.end_date))}`
                : `Loading period`}
            </p>
          </div>
          <ExportButtons startDate={period.startDate} endDate={period.endDate} />
        </div>

        {salesReportError ? (
          <Card className="border-destructive/50 bg-destructive/10 text-destructive">
            <CardContent className="py-6 text-sm">{salesReportError}</CardContent>
          </Card>
        ) : salesReport ? (
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white">
              <CardContent className="pt-6">
                <SalesTrendChart data={salesReport.daily_trend} />
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
                  Top products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopProductsVisualisation
                  products={salesReport.top_products}
                  categories={salesReport.sales_by_category}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  icon: Icon,
  value,
  description,
  change,
}: {
  title: string;
  icon: LucideIcon;
  value: string;
  description?: string;
  change?: number | null | undefined;
}) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-slate-600" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-semibold">{value}</p>
        {description ? <p className="text-xs text-slate-600">{description}</p> : null}
        {change !== undefined ? <ChangeBadge value={change} /> : null}
      </CardContent>
    </Card>
  );
}

function getTotalUnits(report: ApiSalesReport) {
  const categoryUnits = report.sales_by_category.reduce(
    (sum, category) => sum + category.quantity_sold,
    0,
  );
  if (categoryUnits > 0) {
    return categoryUnits;
  }
  return report.top_products.reduce((sum, product) => sum + product.quantity_sold, 0);
}

function getUniqueSkus(report: ApiSalesReport) {
  const unique = new Set(report.top_products.map((product) => product.product_id));
  if (unique.size > 0) {
    return unique.size;
  }
  return report.sales_by_category.length;
}
