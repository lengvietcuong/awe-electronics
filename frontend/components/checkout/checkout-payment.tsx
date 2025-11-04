"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type PaymentMethodId = "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  hint: string;
  surcharge?: number;
}

export interface CardDetails {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  paypalEmail: string;
}

const DEFAULT_CARD_DETAILS: CardDetails = {
  cardHolder: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  paypalEmail: "",
};

export interface CheckoutPaymentProps {
  methods: PaymentMethodOption[];
  value?: PaymentMethodId;
  onChange?: (method: PaymentMethodId) => void;
  cardDetails?: CardDetails;
  onCardDetailsChange?: (details: CardDetails) => void;
}

export function CheckoutPaymentSection({ methods, value, onChange, cardDetails, onCardDetailsChange }: CheckoutPaymentProps) {
  const fallback = React.useMemo(() => value ?? methods[0]?.id ?? "CREDIT_CARD", [methods, value]);
  const [selected, setSelected] = React.useState<PaymentMethodId>(fallback);
  const details = cardDetails ?? DEFAULT_CARD_DETAILS;

  React.useEffect(() => {
    if (value && value !== selected) {
      setSelected(value);
    }
  }, [selected, value]);

  const handleMethodSelect = (methodId: PaymentMethodId) => {
    setSelected(methodId);
    onChange?.(methodId);
  };

  const handleDetailsChange = (patch: Partial<CardDetails>) => {
    onCardDetailsChange?.({ ...details, ...patch });
  };

  const selectedMethod = methods.find((method) => method.id === selected) ?? methods[0];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {methods.map((method) => {
          const isActive = method.id === selected;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodSelect(method.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition",
                "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
                isActive ? "border-primary ring-2 ring-primary/60" : "border-border/70 hover:border-primary/50",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{method.label}</p>
                <p className="text-xs text-muted-foreground">{method.hint}</p>
              </div>
              {method.surcharge ? (
                <Badge variant="outline">Surcharge {method.surcharge}%</Badge>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedMethod?.id === "CREDIT_CARD" ? (
        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-medium text-foreground">Card details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="card-holder">Card holder</Label>
                <Input
                  id="card-holder"
                  placeholder="First Last"
                  value={details.cardHolder}
                  onChange={(event) => handleDetailsChange({ cardHolder: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={details.cardNumber}
                  onChange={(event) => handleDetailsChange({ cardNumber: event.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={details.cardExpiry}
                  onChange={(event) => handleDetailsChange({ cardExpiry: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvv">Security code</Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={details.cardCvv}
                  onChange={(event) => handleDetailsChange({ cardCvv: event.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedMethod?.id === "PAYPAL" ? (
        <Card className="border-border/80">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-medium text-foreground">PayPal account</p>
            <div className="space-y-2">
              <Label htmlFor="paypal-email">PayPal email</Label>
              <Input
                id="paypal-email"
                type="email"
                placeholder="you@example.com"
                value={details.paypalEmail}
                onChange={(event) => handleDetailsChange({ paypalEmail: event.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You will be redirected to PayPal after reviewing your order.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {selectedMethod?.id === "BANK_TRANSFER" ? (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Bank transfer instructions</p>
            <p>We&apos;ll email transfer details and reserve your items for 48 hours.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
