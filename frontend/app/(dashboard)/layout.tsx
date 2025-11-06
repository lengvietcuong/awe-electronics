import type { Metadata } from "next";
import { redirect } from "next/navigation";
import * as React from "react";

import { getCurrentUserServer } from "@/lib/api/auth.server";
import type { ApiAccountProfile } from "@/lib/types/api";
import {
  DashboardNav,
  DashboardNavMobile,
  type DashboardNavItem,
} from "@/components/layout/dashboard-nav";

export const metadata: Metadata = {
  title: {
    default: "Operations Center",
    template: "%s | AWE Electronics",
  },
  description:
    "Administrative workspace for AWE Electronics staff and managers to manage fulfillment and performance.",
};

const STAFF_NAV_ITEMS: DashboardNavItem[] = [
  {
    key: "staff",
    href: "/staff",
    label: "Fulfillment",
    description: "Process orders and manage stock",
    icon: "staff",
  },
  {
    key: "products",
    href: "/staff/products",
    label: "Products",
    description: "Create, edit, and track catalogue",
    icon: "shield",
  },
];

const MANAGER_NAV_ITEMS: DashboardNavItem[] = [
  ...STAFF_NAV_ITEMS,
  {
    key: "manager",
    href: "/manager",
    label: "Insights",
    description: "Review sales and performance",
    icon: "manager",
  },
];

function getDisplayName(profile: ApiAccountProfile) {
  const parts = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return parts || profile.email;
}

const ALLOWED_ROLES: ApiAccountProfile["role"][] = ["staff", "manager"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: ApiAccountProfile | null = null;

  try {
    user = await getCurrentUserServer();
  } catch {
    redirect("/auth/login?redirect=/staff");
  }

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    redirect("/");
  }

  const availableNavItems = user.role === "manager" ? MANAGER_NAV_ITEMS : STAFF_NAV_ITEMS;

  const displayName = getDisplayName(user);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      <DashboardNav
        items={availableNavItems}
        userName={displayName}
        userEmail={user.email}
        role={user.role}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur xl:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  AWE Operations
                </p>
                <h1 className="text-xl font-semibold text-slate-900">{displayName}</h1>
                <p className="text-xs text-slate-600">{user.email}</p>
              </div>
            </div>
            <DashboardNavMobile items={availableNavItems} />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
