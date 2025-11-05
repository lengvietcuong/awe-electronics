"use client";

import * as React from "react";
import { Pencil, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustProductStockAction } from "@/lib/actions/admin-products";

interface AdjustStockFormProps {
  productId: number;
  currentStock: number;
}

export function AdjustStockForm({ productId, currentStock }: AdjustStockFormProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newStock, setNewStock] = React.useState<string>(String(currentStock));
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setNewStock(String(currentStock));
  }, [currentStock]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewStock(String(currentStock));
    setError(null);
  };

  const handleSave = () => {
    setError(null);

    startTransition(async () => {
      const newStockValue = Number(newStock);
      
      if (!Number.isFinite(newStockValue) || newStockValue < 0) {
        setError("Enter a valid non-negative quantity.");
        return;
      }

      const delta = newStockValue - currentStock;
      
      if (delta === 0) {
        setIsEditing(false);
        return;
      }

      const result = await adjustProductStockAction(productId, {
        delta,
        reason: "Stock adjustment",
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsEditing(false);
      setShowSuccess(true);

      // Hide success checkmark after 1 second
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
    });
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-end gap-2">
        {showSuccess ? (
          <Button size="sm" variant="ghost" className="gap-2 text-emerald-600" disabled>
            <Check className="h-4 w-4" />
            Saved
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="h-9 w-24"
          value={newStock}
          onChange={(event) => setNewStock(event.target.value)}
          aria-label="New stock quantity"
          min="0"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="min-w-20"
        >
          {isPending ? (
            "Saving…"
          ) : showSuccess ? (
            <>
              <Check className="h-4 w-4" />
            </>
          ) : (
            "Save"
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
