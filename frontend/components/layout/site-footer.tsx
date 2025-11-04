import Link from "next/link";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { href: "/products?category=computing", label: "Computing" },
      { href: "/products?category=audio", label: "Audio" },
      { href: "/products?category=mobile", label: "Mobile" },
      { href: "/products?category=smart-home", label: "Smart Home" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/order-tracking", label: "Track your order" },
      { href: "#", label: "Shipping & delivery" },
      { href: "#", label: "Returns" },
      { href: "#", label: "Warranty" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Press" },
      { href: "#", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                AE
              </span>
              <span>AWE Electronics</span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Elevating Australian homes and offices with premium electronics, same-day dispatch, and trusted local support.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground/90">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AWE Electronics. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy policy
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms of service
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
