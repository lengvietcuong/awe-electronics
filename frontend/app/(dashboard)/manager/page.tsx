import { redirect } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Boxes,
  LineChart,
  TrendingUp,
} from "lucide-react";

import { getCurrentUserServer } from "@/lib/api/auth.server";
import { fetchQuickStats, fetchSalesReport, fetchInventoryReport } from "@/lib/api/admin/reports";
import type { ApiQuickStats, ApiSalesReport, ApiInventoryReport } from "@/lib/types/api";
import { ApiError } from "@/lib/api/client";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function computeDefaultPeriod() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 29);

  const startDate = start.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

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

export default async function ManagerPage() {
  const user = await getCurrentUserServer();
  if (user.role !== "manager") {
    redirect("/staff");
  }

  const period = computeDefaultPeriod();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_API_BASE_URL ||
    "http://localhost:8000/api";

  const salesExportHref =
    `${apiBaseUrl}/admin/reports/sales/export?start_date=${period.startDate}` +
    `&end_date=${period.endDate}&format=csv`;
  const inventoryExportHref = `${apiBaseUrl}/admin/reports/inventory/export?format=csv`;

  const [quickStatsResult, salesReportResult, inventoryReportResult] =
    await Promise.allSettled([
      fetchQuickStats(),
      fetchSalesReport({ ...period, comparePrevious: true }),
      fetchInventoryReport(),
    ]);

  let quickStats: ApiQuickStats | null = null;
  let salesReport: ApiSalesReport | null = null;
  let inventoryReport: ApiInventoryReport | null = null;

  let quickStatsError: string | null = null;
  let salesReportError: string | null = null;
  let inventoryReportError: string | null = null;

  if (quickStatsResult.status === "fulfilled") {
    quickStats = quickStatsResult.value;
  } else {
    quickStatsError = describeError(quickStatsResult.reason);
  }

  if (salesReportResult.status === "fulfilled") {
    salesReport = salesReportResult.value;
  } else {
    salesReportError = describeError(salesReportResult.reason);
  }

  if (inventoryReportResult.status === "fulfilled") {
    inventoryReport = inventoryReportResult.value;
  } else {
    inventoryReportError = describeError(inventoryReportResult.reason);
  }

  const greetingName = user.first_name || user.email;

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Performance console
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {greetingName}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Track sales momentum, spot inventory risks, and keep leadership informed with live data covering the last 30 days.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              Today&apos;s sales
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            {quickStats ? (
              <div className="space-y-1">
                <p className="text-3xl font-semibold">
                  {formatCurrency(quickStats.today.total_sales)}
                </p>
                <p className="text-xs text-slate-600">
                  {formatNumber(quickStats.today.total_orders)} orders today
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">{quickStatsError ?? "Loading…"}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              This week
            </CardTitle>
            <BarChart2 className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            {quickStats ? (
              <div className="space-y-1">
                <p className="text-3xl font-semibold">
                  {formatCurrency(quickStats.this_week.total_sales)}
                </p>
                <p className="text-xs text-slate-600">
                  {formatNumber(quickStats.this_week.total_orders)} orders secured
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">{quickStatsError ?? "Loading…"}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              This month
            </CardTitle>
            <Boxes className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            {quickStats ? (
              <div className="space-y-2">
                <p className="text-3xl font-semibold">
                  {formatCurrency(quickStats.this_month.total_sales)}
                </p>
                <p className="text-xs text-slate-600">
                  {formatNumber(quickStats.this_month.total_orders)} orders · Average {formatCurrency(quickStats.this_month.average_order_value)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">{quickStatsError ?? "Loading…"}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              Inventory alerts
            </CardTitle>
            <Boxes className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            {quickStats ? (
              <div className="space-y-1">
                <p className="text-3xl font-semibold">
                  {formatNumber(quickStats.inventory.low_stock_alerts)}
                </p>
                <p className="text-xs text-slate-600">
                  Low stock · {formatNumber(quickStats.inventory.out_of_stock)} out of stock
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">{quickStatsError ?? "Loading…"}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Sales performance</h2>
            <p className="text-sm text-slate-600">
              Rolling 30-day window ending {formatDate(new Date())}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="border-slate-300 text-slate-900">
              <a
                href={salesExportHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Export sales (CSV)
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-300 text-slate-900">
              <a
                href={inventoryExportHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Export inventory (CSV)
              </a>
            </Button>
          </div>
        </div>

        {salesReportError ? (
          <Card className="border-destructive/50 bg-destructive/10 text-destructive">
            <CardContent className="py-6 text-sm">{salesReportError}</CardContent>
          </Card>
        ) : salesReport ? (
          <div className="grid gap-4 xl:grid-cols-5">
            <Card className="border-slate-200 bg-white text-white xl:col-span-2">
              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-slate-700">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Total sales
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {formatCurrency(salesReport.total_sales)}
                  </p>
                  <ChangeBadge value={salesReport.comparison?.sales_change_percent} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Orders
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatNumber(salesReport.total_orders)}
                    </p>
                    <ChangeBadge value={salesReport.comparison?.orders_change_percent} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Avg order value
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {formatCurrency(salesReport.average_order_value)}
                    </p>
                    <ChangeBadge value={salesReport.comparison?.aov_change_percent} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p>
                    Period: {formatDate(salesReport.period.start_date)} → {" "}
                    {formatDate(salesReport.period.end_date)}
                  </p>
                  {salesReport.comparison ? (
                    <p>
                      Previous: {formatDate(salesReport.comparison.previous_period_start)} → {" "}
                      {formatDate(salesReport.comparison.previous_period_end)}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white text-white xl:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
                  Top products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Units sold</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.top_products.slice(0, 5).map((product) => (
                        <TableRow key={product.product_id} className="border-slate-100 text-slate-700">
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900">{product.product_name}</p>
                              <p className="text-xs text-slate-500">SKU #{product.product_id}</p>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{formatNumber(product.quantity_sold)}</TableCell>
                          <TableCell>{formatCurrency(product.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Category</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.sales_by_category.map((category) => (
                        <TableRow key={category.category} className="border-slate-100 text-slate-700">
                          <TableCell className="font-semibold text-slate-900">
                            {category.category}
                          </TableCell>
                          <TableCell>{formatNumber(category.order_count)}</TableCell>
                          <TableCell>{formatNumber(category.quantity_sold)}</TableCell>
                          <TableCell>{formatCurrency(category.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Inventory posture</h2>
            <p className="text-sm text-slate-600">
              Track overall stock value and category coverage.
            </p>
          </div>
        </div>

        {inventoryReportError ? (
          <Card className="border-destructive/50 bg-destructive/10 text-destructive">
            <CardContent className="py-6 text-sm">{inventoryReportError}</CardContent>
          </Card>
        ) : inventoryReport ? (
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="border-slate-200 bg-white text-white lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
                  Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total products</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatNumber(inventoryReport.total_products)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Low stock</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatNumber(inventoryReport.low_stock_products)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inventory value</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatCurrency(inventoryReport.total_inventory_value)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white text-white lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
                  Products by category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead>Category</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Units on hand</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryReport.products_by_category.map((category) => (
                        <TableRow key={category.category} className="border-slate-100 text-slate-700">
                          <TableCell className="font-semibold text-slate-900">
                            {category.category}
                          </TableCell>
                          <TableCell>{formatNumber(category.product_count)}</TableCell>
                          <TableCell>{formatNumber(category.total_stock)}</TableCell>
                          <TableCell>{formatCurrency(category.total_value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </div>
  );
}
