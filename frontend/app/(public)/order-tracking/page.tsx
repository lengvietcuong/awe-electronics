import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Printer,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { TrackingPackageSummary } from "@/components/tracking/tracking-package-summary";
import { TrackingStatusBadge } from "@/components/tracking/tracking-status-badge";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockOrderTracking } from "@/lib/data/mock";

const placedAtFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "long",
  timeStyle: "short",
});

export const metadata: Metadata = {
  title: "Track order | AWE Electronics",
  description: "Monitor live shipping updates, delivery timelines, and support notes for your recent order.",
};

export default function OrderTrackingPage() {
  const order = mockOrderTracking;
  const placedAt = placedAtFormatter.format(new Date(order.placedAt));

  return (
    <div className="space-y-12">
      <div className="space-y-3 text-sm text-muted-foreground">
        <Link href="/orders" className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-foreground">
          <h1 className="text-3xl font-bold tracking-tight">Track your order</h1>
          <TrackingStatusBadge status={order.status} />
          <Badge variant="secondary" className="gap-2 text-xs">
            <CalendarClock className="h-3.5 w-3.5" /> {order.eta}
          </Badge>
        </div>
        <p className="max-w-2xl text-base">Follow every step of your shipment from quality checks through to handover with real-time courier scans and technician notes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Order summary</CardTitle>
              <CardDescription>Placed {placedAt}</CardDescription>
            </div>
            <Badge variant="outline" className="gap-2">
              <Truck className="h-3.5 w-3.5" /> {order.carrier.name}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Order number</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Tracking ID</span>
              <span className="font-medium">{order.carrier.trackingNumber}</span>
            </div>
            <Separator className="border-dashed" />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-3.5 w-3.5" /> Download invoice
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-3.5 w-3.5" /> Print receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base">Delivery address</CardTitle>
              <CardDescription>Where we&apos;ll hand the order over.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-foreground">{order.customer.name}</p>
            <p className="text-muted-foreground">{order.shippingAddress}</p>
            <a href={`mailto:${order.customer.email}`} className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
              <Mail className="h-3.5 w-3.5" /> {order.customer.email}
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base">Courier support</CardTitle>
              <CardDescription>Need to reroute or schedule?</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Contact AUS Express Logistics with your tracking ID for live rerouting, authority to leave, or signature updates.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="gap-2">
                <Link href={order.carrier.supportUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Visit tracking portal
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="tel:+611300555019">
                  <Truck className="h-3.5 w-3.5" /> Call courier team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg">Shipment progress</CardTitle>
            <CardDescription>Real-time scans and technician updates pulled from our Melbourne fulfilment hub.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingTimeline events={order.events} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <TrackingPackageSummary items={order.items} summary={order.summary} notes={order.notes} />

          <Card className="border-border/80 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <Truck className="h-4 w-4" /> Delivery guarantee
              </div>
              <p>
                If your delivery misses the ETA, we&apos;ll upgrade you to same-day courier or offer store credit for the delay. Reach out 24/7 and we&apos;ll coordinate.
              </p>
              <Button variant="outline" className="w-fit gap-2" asChild>
                <Link href="/support">
                  <Mail className="h-3.5 w-3.5" /> Message support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
