"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

export interface CartLineItemData {
  id: number;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  category?: string;
  imageUrl?: string | null;
  stockStatus?: string;
  availabilityMessage?: string;
  href?: string;
}

export interface CartLineItemProps {
  item: CartLineItemData;
}

export function CartLineItem({ item }: CartLineItemProps) {
  const [quantity, setQuantity] = React.useState(item.quantity);
  const router = useRouter();
  const [isUpdatingQuantity, startUpdateTransition] = React.useTransition();
  const [isRemoving, startRemoveTransition] = React.useTransition();

  React.useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (nextQuantity: number) => {
    if (nextQuantity < MIN_QUANTITY || nextQuantity > MAX_QUANTITY || nextQuantity === quantity) {
      return;
    }

    setQuantity(nextQuantity);
    startUpdateTransition(async () => {
      const result = await updateCartItemQuantity(item.id, nextQuantity);

      if (!result?.success) {
        setQuantity(item.quantity);
        console.error(result?.error ?? "Failed to update quantity");
        return;
      }

      router.refresh();
    });
  };

  const handleRemove = () => {
    startRemoveTransition(async () => {
      const result = await removeCartItem(item.id);

      if (!result?.success) {
        console.error(result?.error ?? "Failed to remove cart item");
        return;
      }

      router.refresh();
    });
  };

  const decrementQuantity = () => handleQuantityChange(quantity - 1);
  const incrementQuantity = () => handleQuantityChange(quantity + 1);

  const isBusy = isUpdatingQuantity || isRemoving;

  const priceDisplay = React.useMemo(
    () =>
      Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
      }).format(item.unitPrice * quantity),
    [item.unitPrice, quantity],
  );

  const imageContent = item.imageUrl ? (
    <Image src={item.imageUrl} alt={item.name} fill sizes="112px" className="object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
      No image
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-square h-28 w-28 overflow-hidden rounded-lg border border-border/60 bg-muted">
          {imageContent}
        </div>
        <div className="flex flex-1 flex-col gap-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Link
                href={item.href ?? `/products/${item.productId}`}
                className="text-base font-semibold text-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
              {item.category ? (
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.category}</p>
              ) : null}
              {item.availabilityMessage ? (
                <p className="text-xs text-muted-foreground">{item.availabilityMessage}</p>
              ) : null}
            </div>
            <span className="text-base font-semibold">{priceDisplay}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {item.stockStatus ? <span className="font-medium text-foreground">{item.stockStatus}</span> : null}
            <div className="flex items-center gap-2">
              <span className="text-xs">Qty</span>
              <div className="flex items-center gap-1 rounded-md border border-border/70">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none"
                  onClick={decrementQuantity}
                  disabled={quantity <= MIN_QUANTITY || isBusy}
                  aria-label={`Decrease quantity for ${item.name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none"
                  onClick={incrementQuantity}
                  disabled={quantity >= MAX_QUANTITY || isBusy}
                  aria-label={`Increase quantity for ${item.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-xs font-normal text-rose-600 hover:text-rose-700"
              onClick={handleRemove}
              disabled={isRemoving}
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}
