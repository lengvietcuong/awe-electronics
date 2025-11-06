"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApiProduct } from "@/lib/types/api";
import {
  activateProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/actions/admin-products";

interface ProductRowActionsProps {
  product: ApiProduct;
  onEdit: (product: ApiProduct) => void;
  canDelete: boolean;
}

export function ProductRowActions({ product, onEdit, canDelete }: ProductRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const openEditor = () => {
    onEdit(product);
  };

  const handleAction = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Unable to complete action.");
        return;
      }
      setConfirmDelete(false);
      router.refresh();
    });
  };

  const deactivate = () =>
    handleAction(() =>
      updateProductAction(product.id, {
        is_active: false,
      }),
    );

  const activate = () => handleAction(() => activateProductAction(product.id));

  const remove = () => handleAction(() => deleteProductAction(product.id));

  const isActive = product.is_active && !product.is_discontinued;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          disabled={isPending}
          onClick={openEditor}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>

        {isActive ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isPending}
            onClick={deactivate}
          >
            <Ban className="h-3.5 w-3.5" />
            Deactivate
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isPending}
            onClick={activate}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Activate
          </Button>
        )}

        {canDelete ? (
          confirmDelete ? (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={remove}
                disabled={isPending}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
