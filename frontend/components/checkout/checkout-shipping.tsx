"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  eta: string;
  price: number;
  recommended?: boolean;
}

export interface CheckoutShippingProps {
  options: ShippingOption[];
  value?: string;
  onChange?: (optionId: string) => void;
}

export function CheckoutShippingOptions({ options, value, onChange }: CheckoutShippingProps) {
  const fallback = React.useMemo(
    () => options.find((option) => option.recommended)?.id ?? options[0]?.id ?? null,
    [options],
  );

  const [selected, setSelected] = React.useState<string | null>(value ?? fallback);

  React.useEffect(() => {
    if (value && value !== selected) {
      setSelected(value);
    }
  }, [selected, value]);

  React.useEffect(() => {
    if (selected == null && fallback) {
      setSelected(fallback);
      onChange?.(fallback);
    }
  }, [fallback, onChange, selected]);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isActive = option.id === selected;
        const priceDisplay = option.price === 0 ? "Free" : formatter.format(option.price);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setSelected(option.id);
              onChange?.(option.id);
            }}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition",
              "flex flex-col gap-2",
              isActive ? "border-primary ring-2 ring-primary/60" : "border-border/70 hover:border-primary/40",
            )}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{option.label}</p>
                  {option.recommended ? <Badge variant="secondary">Recommended</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{priceDisplay}</p>
                <p>{option.eta}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
