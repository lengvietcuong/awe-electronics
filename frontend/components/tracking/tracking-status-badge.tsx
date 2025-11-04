import { Clock4, PackageOpen, Truck, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Awaiting payment",
    icon: Clock4,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  PROCESSING: {
    label: "Processing",
    icon: PackageOpen,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "border-blue-500/40 bg-blue-500/10 text-blue-600",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    icon: Truck,
    className: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  },
  PAYMENT_FAILED: {
    label: "Payment failed",
    icon: XCircle,
    className: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  },
} as const;

export type TrackingStatus = keyof typeof STATUS_CONFIG | string;

export function getTrackingStatusConfig(status: TrackingStatus) {
  if (status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  }

  const fallbackLabel = typeof status === "string" && status.length
    ? status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Status";

  return {
    label: fallbackLabel,
    icon: Clock4 as LucideIcon,
    className: "border-border/60 bg-muted/40 text-muted-foreground",
  };
}

export interface TrackingStatusBadgeProps {
  status: TrackingStatus;
  className?: string;
  showLabel?: boolean;
}

export function TrackingStatusBadge({ status, className, showLabel = true }: TrackingStatusBadgeProps) {
  const config = getTrackingStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-2 border", config.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel ? <span>{config.label}</span> : null}
    </Badge>
  );
}
