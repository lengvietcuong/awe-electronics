import { Clock4, PackageOpen, Truck, CheckCircle2, type LucideIcon } from "lucide-react";

import type { TrackingStatus } from "@/lib/data/mock";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<TrackingStatus, {
  label: string;
  icon: LucideIcon;
  className: string;
}> = {
  processing: {
    label: "Processing",
    icon: Clock4,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  packed: {
    label: "Packed",
    icon: PackageOpen,
    className: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  in_transit: {
    label: "In transit",
    icon: Truck,
    className: "border-blue-500/40 bg-blue-500/10 text-blue-600",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  },
};

export function getTrackingStatusConfig(status: TrackingStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
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
