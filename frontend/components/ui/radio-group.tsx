"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  const handleChange = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<RadioProps>(child)) return child;
        const childValue = (child.props as any).value;
        return React.cloneElement(child, {
          checked: childValue === currentValue,
          onChange: () => handleChange(childValue),
        } as Partial<RadioProps>);
      })}
    </div>
  );
}

export type RadioProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, children, ...props }, ref) => (
    <label className={cn("flex cursor-pointer items-center gap-2", className)}>
      <input
        ref={ref}
        type="radio"
        className="h-4 w-4 appearance-none rounded-full border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2"
        {...props}
      />
      <span className="text-sm text-muted-foreground">{children}</span>
    </label>
  ),
);
Radio.displayName = "Radio";
