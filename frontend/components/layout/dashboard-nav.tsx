"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, PackageSearch, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatStatusLabel } from "@/lib/formatters";

export interface DashboardNavItem {
  key: string;
  href: string;
  label: string;
  description?: string;
  icon?: "home" | "staff" | "manager" | "shield";
}

interface DashboardNavProps {
  items: DashboardNavItem[];
  userName: string;
  userEmail: string;
  role: string;
}

const iconMap: Record<NonNullable<DashboardNavItem["icon"]>, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  home: Home,
  staff: PackageSearch,
  manager: BarChart3,
  shield: ShieldCheck,
};

export function DashboardNav({ items, userName, userEmail, role }: DashboardNavProps) {
  const pathname = usePathname();
  const roleLabel = formatStatusLabel(role);

  return (
  <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 xl:flex">
      <div className="flex h-full flex-col gap-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Control center
          </p>
          <h1 className="text-2xl font-bold text-slate-900">AWE Electronics</h1>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-900">
          <p className="text-sm text-slate-600">Signed in as</p>
          <p className="text-lg font-semibold leading-tight text-slate-900">{userName}</p>
          <p className="text-xs text-slate-600">{userEmail}</p>
          <span className="inline-flex w-fit rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
            {roleLabel}
          </span>
        </div>

        {items.length > 0 && (
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon ? iconMap[item.icon] : PackageSearch;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col gap-1 rounded-xl border border-transparent px-4 py-3 transition-colors",
                    isActive
                      ? "border-slate-300 bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                      {item.label}
                    </span>
                  </div>
                  {item.description ? (
                    <span className="text-xs text-slate-600 group-hover:text-slate-700">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="space-y-3 text-xs text-slate-500">
          <p className="font-semibold uppercase tracking-[0.2em]">Shortcuts</p>
          <div className="flex flex-col gap-1 text-slate-600">
            <Link
              href="/"
              className="transition-colors hover:text-slate-900"
            >
              Return to storefront
            </Link>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-slate-900"
            >
              Switch account
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DashboardNavMobile({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex-1 rounded-full border px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
              isActive
                ? "border-slate-300 bg-slate-100 text-slate-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
