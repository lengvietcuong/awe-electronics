"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = InputProps & {
  toggleLabel?: {
    show: string;
    hide: string;
  };
};

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleLabel, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const labels = toggleLabel ?? {
      show: "Show password",
      hide: "Hide password",
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-pressed={isVisible}
          aria-label={isVisible ? labels.hide : labels.show}
          className="absolute inset-y-1/2 right-0 flex -translate-y-1/2 items-center justify-center rounded-md px-3 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          {isVisible ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
