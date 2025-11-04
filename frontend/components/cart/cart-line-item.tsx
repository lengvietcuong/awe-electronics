"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import type { CartLineItem } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1);

export interface CartLineItemProps {
  item: CartLineItem;
}

export function CartLineItem({ item }: CartLineItemProps) {
  const [quantity, setQuantity] = React.useState(item.quantity);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-square h-28 w-28 overflow-hidden rounded-lg border border-border/60 bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Link
                href={`/products/${item.productId}`}
                className="text-base font-semibold text-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.category}
              </p>
              {item.availabilityMessage ? (
                <p className="text-xs text-muted-foreground">{item.availabilityMessage}</p>
              ) : null}
            </div>
            <span className="text-base font-semibold">
              {Intl.NumberFormat("en-AU", {
                style: "currency",
                currency: "AUD",
              }).format(item.price * quantity)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{item.stockStatus}</span>
            <div className="flex items-center gap-2">
              <label htmlFor={`quantity-${item.id}`} className="text-xs">
                Qty
              </label>
              <Select
                id={`quantity-${item.id}`}
                value={String(quantity)}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-20"
                aria-label={`Update quantity for ${item.name}`}
              >
                {quantityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-normal">
              Save for later
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-normal text-rose-600 hover:text-rose-700">
              Remove
            </Button>
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}
