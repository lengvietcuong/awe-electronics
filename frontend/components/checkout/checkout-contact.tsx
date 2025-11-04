"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CheckoutContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingOptIn: boolean;
}

const DEFAULT_CONTACT: CheckoutContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  marketingOptIn: false,
};

export interface CheckoutContactProps {
  value?: CheckoutContactForm;
  onChange?: (value: CheckoutContactForm) => void;
}

export function CheckoutContactSection({ value, onChange }: CheckoutContactProps) {
  const formState = value ?? DEFAULT_CONTACT;

  const updateForm = React.useCallback(
    (patch: Partial<CheckoutContactForm>) => {
      onChange?.({ ...formState, ...patch });
    },
    [formState, onChange],
  );

  const handleChange = (key: keyof CheckoutContactForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue =
      key === "marketingOptIn" ? (event.target as HTMLInputElement).checked : event.target.value;
    updateForm({ [key]: nextValue } as Partial<CheckoutContactForm>);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first-name">First name</Label>
          <Input
            id="first-name"
            value={formState.firstName}
            onChange={handleChange("firstName")}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input id="last-name" value={formState.lastName} onChange={handleChange("lastName")} placeholder="Last name" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formState.email} onChange={handleChange("email")} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formState.phone} onChange={handleChange("phone")} placeholder="+61" />
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
        <Checkbox id="marketing-opt-in" checked={formState.marketingOptIn} onChange={handleChange("marketingOptIn")} />
        <Label htmlFor="marketing-opt-in" className="text-sm font-normal leading-snug text-muted-foreground">
          Keep me updated with product launches and seasonal bundles.
        </Label>
      </div>
      <Button variant="outline" size="sm">
        Already have an account? Sign in
      </Button>
    </div>
  );
}
