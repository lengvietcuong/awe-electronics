import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "AWE Electronics",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
