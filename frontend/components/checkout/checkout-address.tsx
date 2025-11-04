"use client";

import * as React from "react";

import type { CheckoutAddress } from "@/lib/data/mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CheckoutAddressProps {
  addresses: CheckoutAddress[];
}

export function CheckoutAddressSelector({ addresses }: CheckoutAddressProps) {
  const [selected, setSelected] = React.useState(() => addresses.find((addr) => addr.isDefault)?.id ?? addresses[0]?.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          const isActive = selected === address.id;
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => setSelected(address.id)}
              className={cn(
                "text-left",
                "rounded-xl border p-4 transition",
                isActive ? "border-primary ring-2 ring-primary/60" : "border-border/70 hover:border-primary/50",
              )}
            >
              <p className="text-sm font-semibold text-foreground">{address.label}</p>
              <p className="text-sm text-muted-foreground">{address.contactName}</p>
              <p className="text-sm text-muted-foreground">{address.line1}</p>
              {address.line2 ? <p className="text-sm text-muted-foreground">{address.line2}</p> : null}
              <p className="text-sm text-muted-foreground">
                {address.suburb}, {address.state} {address.postcode}
              </p>
              {address.instructions ? (
                <p className="mt-2 text-xs text-muted-foreground">{address.instructions}</p>
              ) : null}
            </button>
          );
        })}
      </div>
      <Card className="border-dashed border-border/80">
        <CardContent className="flex flex-col gap-2 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Delivering somewhere else?</p>
          <p>Save a new address to reuse on future orders.</p>
          <Button variant="outline" size="sm" className="w-fit">
            Add new address
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
