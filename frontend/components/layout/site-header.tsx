"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShoppingCart, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const primaryNav = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=computing", label: "Computing" },
  { href: "/products?category=audio", label: "Audio" },
  { href: "/products?category=gaming", label: "Gaming" },
  { href: "/order-tracking", label: "Track Order" },
];

interface SiteHeaderProps {
  cartItemCount?: number;
}

export function SiteHeader({ cartItemCount = 0 }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
  <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
  <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Zap className="h-6 w-6" />
            </span>
            <span className="hidden sm:inline">AWE Electronics</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {cartItemCount}
            </span>
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Create account</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="md:hidden">
      <div className="border-t border-border/80 bg-background">
        <nav className="flex flex-col gap-4 px-4 py-4">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Button variant="outline" asChild>
              <Link href="/cart" onClick={onClose}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> Cart
                </div>
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/auth/login" onClick={onClose}>
                Sign in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register" onClick={onClose}>
                Create account
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
