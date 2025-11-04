"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { AuthSync } from "@/components/auth/auth-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthSync />
      {children}
    </AuthProvider>
  );
}
