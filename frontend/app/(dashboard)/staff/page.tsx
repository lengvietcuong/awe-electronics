import { PackageSearch, ShoppingBasket } from "lucide-react";

import { getCurrentUserServer } from "@/lib/api/auth.server";
import { fetchPendingOrders } from "@/lib/api/admin/orders";
import { fetchLowStockProducts } from "@/lib/api/admin/products";
import type { ApiOrderResponse, ApiProduct } from "@/lib/types/api";
import { ApiError } from "@/lib/api/client";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatStatusLabel,
} from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdjustStockForm } from "@/components/staff/adjust-stock-form";
import { ShipOrderButton } from "@/components/staff/ship-order-button";
import { MarkDeliveredButton } from "@/components/staff/mark-delivered-button";
import { DeleteOrderButton } from "@/components/common/delete-order-button";

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

function summariseOrderItems(order: ApiOrderResponse) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItems = order.items.length;
  return `${totalItems} item${totalItems === 1 ? "" : "s"} across ${uniqueItems} SKU${
    uniqueItems === 1 ? "" : "s"
  }`;
}

function getStatusVariant(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "PAID":
      return "secondary" as const;
    case "PROCESSING":
      return "default" as const;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "success" as const;
    case "PAYMENT_FAILED":
    case "CANCELLED":
      return "warning" as const;
    default:
      return "outline" as const;
  }
}

function canMarkDelivered(status: string) {
  return ["SHIPPED", "OUT_FOR_DELIVERY"].includes(status.toUpperCase());
}

export default async function StaffPage() {
  const user = await getCurrentUserServer();

  const [pendingOrdersResult, lowStockResult] = await Promise.allSettled([
    fetchPendingOrders(),
    fetchLowStockProducts(),
  ]);

  let pendingOrders: ApiOrderResponse[] = [];
  let pendingOrdersError: string | null = null;
  if (pendingOrdersResult.status === "fulfilled") {
    pendingOrders = pendingOrdersResult.value;
  } else {
    pendingOrdersError = describeError(pendingOrdersResult.reason);
  }

  let lowStockProducts: ApiProduct[] = [];
  let lowStockError: string | null = null;
  if (lowStockResult.status === "fulfilled") {
    lowStockProducts = lowStockResult.value;
  } else {
    lowStockError = describeError(lowStockResult.reason);
  }

  const totalOrders = pendingOrders.length;
  const totalItemsToPack = pendingOrders.reduce(
    (sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0),
    0,
  );
  const totalOrderValue = pendingOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0,
  );

  const nameForGreeting = user.first_name || user.email;

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Fulfillment workspace
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Hi {nameForGreeting}, let&apos;s move these orders
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Review every order waiting to leave the warehouse and keep stock levels up to date.
            Actions here update customer status pages instantly.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              Orders in queue
            </CardTitle>
            <PackageSearch className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {formatNumber(totalOrders)}
            </div>
            <p className="text-xs text-slate-600">Awaiting shipment</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              Items to pack
            </CardTitle>
            <ShoppingBasket className="h-5 w-5 text-slate-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {formatNumber(totalItemsToPack)}
            </div>
            <p className="text-xs text-slate-600">Units reserved across orders</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white text-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              Pending revenue
            </CardTitle>
            <span className="text-slate-600" aria-hidden>
              $
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {formatCurrency(totalOrderValue)}
            </div>
            <p className="text-xs text-slate-600">Value to recognise once shipped</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Fulfillment queue</h2>
            <p className="text-sm text-slate-700">
              Orders that are paid and ready for shipment.
            </p>
          </div>
        </div>

        {pendingOrdersError ? (
          <Card className="border-destructive/50 bg-destructive/10 text-destructive">
            <CardContent className="py-6 text-sm">
              {pendingOrdersError}
            </CardContent>
          </Card>
        ) : pendingOrders.length === 0 ? (
          <Card className="border-slate-200 bg-white text-slate-700">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <PackageSearch className="h-10 w-10 text-slate-500" aria-hidden />
              <h3 className="text-lg font-semibold text-slate-900">No orders waiting</h3>
              <p className="max-w-sm text-sm text-slate-600">
                When a customer pays for an order it will appear here, ready for packing and dispatch.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id} className="border-slate-100 text-slate-700">
                    <TableCell className="font-semibold text-slate-900">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                        <span className="text-xs text-slate-600">
                          Placed {formatDate(order.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <p className="text-sm font-medium text-slate-900">
                          Customer #{order.customer_id}
                        </p>
                        <p>Shipping to {order.delivery_address.suburb}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <span>{summariseOrderItems(order)}</span>
                        <span className="text-slate-500">
                          Shipping via {formatStatusLabel(order.shipping_method)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-row items-center justify-end gap-2">
                        <ShipOrderButton orderId={order.id} />
                        {canMarkDelivered(order.status) ? (
                          <MarkDeliveredButton orderId={order.id} />
                        ) : null}
                        <DeleteOrderButton orderId={order.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Low stock alerts</h2>
            <p className="text-sm text-slate-700">
              Products at or below their replenishment threshold. Adjust quantities once replenished.
            </p>
          </div>
        </div>

        {lowStockError ? (
          <Card className="border-destructive/50 bg-destructive/10 text-destructive">
            <CardContent className="py-6 text-sm">
              {lowStockError}
            </CardContent>
          </Card>
        ) : lowStockProducts.length === 0 ? (
          <Card className="border-slate-200 bg-white text-slate-700">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <ShoppingBasket className="h-10 w-10 text-slate-500" aria-hidden />
              <h3 className="text-lg font-semibold text-slate-900">Inventory looks healthy</h3>
              <p className="max-w-sm text-sm text-slate-600">
                Once products approach their low stock threshold they will appear here so you can restock quickly.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead>Product</TableHead>
                  <TableHead>Stock quantity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id} className="border-slate-100 text-slate-700">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{product.name}</span>
                        <span className="text-xs text-slate-600">
                          SKU #{product.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(product.stock_quantity)} items</TableCell>
                    <TableCell className="text-right">
                      <AdjustStockForm productId={product.id} currentStock={product.stock_quantity} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
