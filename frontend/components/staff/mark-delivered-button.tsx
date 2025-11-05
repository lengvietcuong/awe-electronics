"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { markOrderDeliveredAction } from "@/lib/actions/admin-orders";

interface MarkDeliveredButtonProps {
  orderId: number;
}

export function MarkDeliveredButton({ orderId }: MarkDeliveredButtonProps) {
  const router = useRouter();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleDeliver = React.useCallback(() => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await markOrderDeliveredAction(orderId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage("Order marked as delivered");
      // Wait 1 second before refreshing to show the success message
      setTimeout(() => {
        router.refresh();
      }, 1000);
    });
  }, [orderId, router]);

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleDeliver}
        disabled={isPending}
        className="cursor-pointer"
      >
        {isPending ? "Saving…" : "Mark delivered"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
    </div>
  );
}
