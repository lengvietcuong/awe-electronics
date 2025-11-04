"use client";

import * as React from "react";

import type { PaymentMethodPreview } from "@/lib/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const secureIcons: Record<PaymentMethodPreview["type"], string> = {
  card: "💳",
  paypal: "🅿️",
  afterpay: "🅰️",
};

export interface CheckoutPaymentProps {
  methods: PaymentMethodPreview[];
}

export function CheckoutPaymentSection({ methods }: CheckoutPaymentProps) {
  const [selected, setSelected] = React.useState(methods[0]?.id ?? "");

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {methods.map((method) => {
          const isActive = method.id === selected;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelected(method.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition",
                "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
                isActive ? "border-primary ring-2 ring-primary/60" : "border-border/70 hover:border-primary/50",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {secureIcons[method.type]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.hint}</p>
                </div>
              </div>
              {method.surcharge ? (
                <Badge variant="outline">Surcharge {method.surcharge}%</Badge>
              ) : null}
            </button>
          );
        })}
      </div>

      <Card className="border-border/80">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm font-medium text-foreground">Securely stored card details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card-holder">Card holder</Label>
              <Input id="card-holder" placeholder="Jordan Nguyen" defaultValue="Jordan Nguyen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" defaultValue="**** **** **** 1234" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry</Label>
              <Input id="card-expiry" placeholder="MM/YY" defaultValue="08/27" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvv">Security code</Label>
              <Input id="card-cvv" placeholder="123" defaultValue="***" />
            </div>
          </div>
          <Button className="w-full">Pay securely</Button>
          <p className="text-xs text-muted-foreground">
            Payments are encrypted and processed by Australian-based banking partners. We never store your raw card numbers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
