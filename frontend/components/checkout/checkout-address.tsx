"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CheckoutAddressForm {
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  instructions?: string;
}

const DEFAULT_ADDRESS: CheckoutAddressForm = {
  streetAddress: "",
  suburb: "",
  state: "",
  postcode: "",
  country: "Australia",
  instructions: "",
};

export interface CheckoutAddressProps {
  value?: CheckoutAddressForm;
  onChange?: (value: CheckoutAddressForm) => void;
}

export function CheckoutAddressSelector({ value, onChange }: CheckoutAddressProps) {
  const address = value ?? DEFAULT_ADDRESS;

  const handleChange = (key: keyof CheckoutAddressForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    onChange?.({ ...address, [key]: nextValue });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="address-line1">Street address</Label>
          <Input
            id="address-line1"
            value={address.streetAddress}
            onChange={handleChange("streetAddress")}
            placeholder="123 Collins Street"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address-suburb">Suburb</Label>
            <Input
              id="address-suburb"
              value={address.suburb}
              onChange={handleChange("suburb")}
              placeholder="Melbourne"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-state">State</Label>
            <Input
              id="address-state"
              value={address.state}
              onChange={handleChange("state")}
              placeholder="VIC"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="address-postcode">Postcode</Label>
            <Input
              id="address-postcode"
              value={address.postcode}
              onChange={handleChange("postcode")}
              placeholder="3000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address-country">Country</Label>
            <Input
              id="address-country"
              value={address.country}
              onChange={handleChange("country")}
              placeholder="Australia"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address-instructions">Delivery instructions (optional)</Label>
          <Input
            id="address-instructions"
            value={address.instructions ?? ""}
            onChange={handleChange("instructions")}
            placeholder="Leave at reception if unattended"
          />
        </div>
      </div>
    </div>
  );
}
