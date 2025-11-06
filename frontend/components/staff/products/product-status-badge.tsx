import * as React from "react";

import { Badge } from "@/components/ui/badge";
import type { ApiProduct } from "@/lib/types/api";

interface ProductStatusBadgesProps {
  product: ApiProduct;
}

export function ProductStatusBadges({ product }: ProductStatusBadgesProps) {
  const badges: Array<{ label: string; variant: "success" | "warning" | "outline" | "default" }> = [];

  if (!product.is_active || product.is_discontinued) {
    badges.push({ label: "Inactive", variant: "outline" });
  } else {
    badges.push({ label: "Active", variant: "success" });
  }

  if (product.available_quantity <= 0) {
    badges.push({ label: "Out of stock", variant: "warning" });
  } else if (product.is_low_stock) {
    badges.push({ label: "Low stock", variant: "warning" });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
