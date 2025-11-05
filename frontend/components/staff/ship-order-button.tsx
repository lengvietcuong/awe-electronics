"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Package, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { shipOrderAction } from "@/lib/actions/admin-orders";

interface ShipOrderButtonProps {
  orderId: number;
}

export function ShipOrderButton({ orderId }: ShipOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleShip = React.useCallback(async () => {
    setError(null);
    
    const result = await shipOrderAction(orderId, {});
    if (!result.success) {
      setError(result.error);
      return;
    }

    // Show checkmark for 1 second before row disappears
    setShowSuccess(true);
    setTimeout(() => {
      router.refresh();
    }, 1000);
  }, [orderId, router]);

  if (showSuccess) {
    return (
      <Button size="sm" disabled className="w-[68px] cursor-default bg-emerald-600 hover:bg-emerald-600">
        <Check className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" onClick={handleShip} className="w-[68px] cursor-pointer">
        <Package className="h-4 w-4 mr-1" />
        Ship
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
