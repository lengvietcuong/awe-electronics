"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

import { fetchOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ApiOrderListResponse } from "@/lib/types/api";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "success" | "warning" {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "success";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "secondary";
    case "CANCELLED":
    case "PAYMENT_FAILED":
      return "warning";
    default:
      return "outline";
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return <Truck className="h-4 w-4" />;
    case "CANCELLED":
    case "PAYMENT_FAILED":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export default function OrdersPage() {
  const router = useRouter();
  const [ordersData, setOrdersData] = React.useState<ApiOrderListResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const data = await fetchOrders({ page: 1, pageSize: 50 });
        setOrdersData(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/auth/login?redirect=/orders");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">
                View your order history and track deliveries
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">
                View your order history and track deliveries
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ordersData) {
    return null;
  }

  const { orders, total } = ordersData;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground">
              View your order history and track deliveries
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>

      <Separator />

      {orders.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">No orders yet</h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Start exploring our catalogue and place your first order to see it here.
            </p>
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
            {total > orders.length ? ` of ${total} total` : ""}
          </p>

          {orders.map((order) => (
            <Card key={order.id} className="border-border/80">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="gap-1.5">
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(order.total_amount)}
                    </p>
                    {order.tracking_number ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/order-tracking?order=${order.order_number}`}>
                          Track order
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
                      >
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.product_id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(item.line_total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Delivery Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_address.street_address}
                      <br />
                      {order.delivery_address.suburb}, {order.delivery_address.state}{" "}
                      {order.delivery_address.postcode}
                      <br />
                      {order.delivery_address.country}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
                    <div className="space-y-0.5 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping ({formatStatus(order.shipping_method)}):</span>
                        <span>{formatCurrency(order.shipping_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax_amount)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.estimated_delivery ? (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Estimated delivery:</span>{" "}
                      {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
