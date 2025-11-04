import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, Mail, ShieldCheck, Truck } from "lucide-react";

import { TrackingStatusBadge, type TrackingStatus } from "@/components/tracking/tracking-status-badge";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchTracking } from "@/lib/api/tracking";
import { ApiError } from "@/lib/api/client";
import type { ApiOrderTrackingResponse } from "@/lib/types/api";

const dateTimeFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) return null;

  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function normaliseStatus(status?: string | null): TrackingStatus | undefined {
  if (!status) return undefined;

  return status.replace(/\s+/g, "_").toUpperCase() as TrackingStatus;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function loadTracking(orderNumber: string, email: string): Promise<ApiOrderTrackingResponse | { error: string }> {
  try {
    return await fetchTracking(orderNumber, email);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return { error: "We couldn't find an order with those details. Double-check the order number and email, then try again." };
      }

      return {
        error: error.payload && typeof error.payload === "object" && "detail" in error.payload
          ? String((error.payload as { detail?: unknown }).detail ?? error.statusText)
          : error.statusText,
      };
    }

    throw error;
  }
}

export const metadata: Metadata = {
  title: "Track order | AWE Electronics",
  description: "Monitor live shipping updates, delivery timelines, and support notes for your recent order.",
};

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderNumberParam = params.order;
  const emailParam = params.email;
  const orderNumber = Array.isArray(orderNumberParam) ? orderNumberParam[0] : orderNumberParam;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;

  const trackingResult = orderNumber && email ? await loadTracking(orderNumber, email) : null;
  const errorMessage = trackingResult && "error" in trackingResult ? trackingResult.error : null;
  const tracking = trackingResult && !errorMessage ? (trackingResult as ApiOrderTrackingResponse) : null;
  const statusKey = normaliseStatus(tracking?.status);
  const estimatedDelivery = formatDateTime(tracking?.estimated_delivery);
  const shippedAt = formatDateTime(tracking?.shipped_at);
  const deliveredAt = formatDateTime(tracking?.delivered_at);
  const lastUpdated = formatDateTime(tracking?.status_history?.at(-1)?.timestamp);

  return (
    <div className="space-y-12">
      <div className="space-y-3 text-sm text-muted-foreground">
        <Link href="/orders" className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-foreground">
          <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
          {statusKey ? <TrackingStatusBadge status={statusKey} /> : null}
          {estimatedDelivery ? (
            <Badge variant="secondary" className="gap-2 text-xs">
              <CalendarClock className="h-3.5 w-3.5" /> Estimated delivery {estimatedDelivery}
            </Badge>
          ) : null}
        </div>
        <p className="max-w-2xl text-base">Follow every step of your shipment from quality checks through to handover with real-time courier scans and technician notes.</p>
      </div>


      <Card className="border-border/80">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">Find your order</CardTitle>
          <CardDescription>Enter the order number from your confirmation email plus the email address used at checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="order">Order number</Label>
              <Input id="order" name="order" placeholder="AWE-12345" defaultValue={orderNumber ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" defaultValue={email ?? ""} required />
            </div>
            <Button type="submit" className="h-10 px-6">Track order</Button>
          </form>
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="space-y-2 p-6 text-sm text-destructive-foreground">
            <p className="font-semibold">We couldn’t find that order.</p>
            <p>{errorMessage}</p>
            <p>
              Need a hand? <Link href="/support" className="font-medium text-destructive-foreground underline underline-offset-4">Contact our support team</Link> and we’ll look it up for you.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {tracking ? (
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/80">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Order summary</CardTitle>
                <CardDescription>Last updated {lastUpdated ?? "moments ago"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Order number</span>
                  <span className="font-medium">{tracking.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Tracking ID</span>
                  <span className="font-medium">{tracking.tracking_number ?? "Pending"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Status</span>
                  {statusKey ? <TrackingStatusBadge status={statusKey} showLabel={false} /> : <span className="font-medium text-foreground">Updating</span>}
                </div>
                {estimatedDelivery ? (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">ETA</span>
                    <span className="font-medium text-foreground">{estimatedDelivery}</span>
                  </div>
                ) : null}
                {shippedAt ? (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Shipped</span>
                    <span className="font-medium text-foreground">{shippedAt}</span>
                  </div>
                ) : null}
                {deliveredAt ? (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Delivered</span>
                    <span className="font-medium text-foreground">{deliveredAt}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="flex flex-row items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="space-y-1">
                  <CardTitle className="text-base">Email updates are active</CardTitle>
                  <CardDescription>We&apos;ll notify {email ?? "you"} if delivery timings change.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Make sure our messages aren&apos;t landing in spam — add <span className="font-medium text-foreground">orders@awe-electronics.com</span> to your contacts.</p>
                <p>If you&apos;d like SMS updates, reply to any email and we&apos;ll enable them for you.</p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="flex flex-row items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="space-y-1">
                  <CardTitle className="text-base">Need help with delivery?</CardTitle>
                  <CardDescription>Our logistics team can reroute, hold, or arrange pickup windows.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Call us on <Link href="tel:+611300555019" className="font-medium text-primary">1300 555 019</Link> or lodge a ticket for tailored assistance.</p>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/support">
                    <Truck className="h-3.5 w-3.5" /> Contact support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Shipment progress</CardTitle>
              <CardDescription>Live events supplied by our fulfilment system.</CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={tracking.status_history} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
