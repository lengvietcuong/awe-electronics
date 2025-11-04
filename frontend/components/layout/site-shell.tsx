import * as React from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCartItemCount } from "@/lib/data/cart";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const cartItemCount = await getCartItemCount();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader cartItemCount={cartItemCount} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
