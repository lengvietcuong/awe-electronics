import { MapPin } from "lucide-react";

import type { ApiOrderTrackingEvent } from "@/lib/types/api";
import { cn } from "@/lib/utils";

import { TrackingStatusBadge, getTrackingStatusConfig, type TrackingStatus } from "./tracking-status-badge";

const timestampFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTimestamp(value: string) {
  try {
    return timestampFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export interface TrackingTimelineProps {
  events: ApiOrderTrackingEvent[];
  className?: string;
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  if (!events?.length) return null;

  return (
    <ol className={cn("space-y-6", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const statusKey = (event.status ?? "").replace(/\s+/g, "_").toUpperCase() as TrackingStatus;
        const config = getTrackingStatusConfig(statusKey);
        const Icon = config.icon;

        return (
          <li key={`${event.status}-${event.timestamp}`} className="flex gap-4">
            <div className="flex w-10 flex-col items-center">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground shadow-sm",
                  config.className,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {!isLast ? <span className="my-1 w-px flex-1 bg-border/60" /> : null}
            </div>

            <div className="flex-1 space-y-2 rounded-xl border border-border/60 bg-card/60 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-foreground">{event.status}</p>
                <TrackingStatusBadge status={statusKey} />
                <span className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp ?? "")}</span>
              </div>
              {event.description ? <p className="text-sm text-muted-foreground">{event.description}</p> : null}
              {event.location ? (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
