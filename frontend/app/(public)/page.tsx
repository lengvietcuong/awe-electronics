import Link from "next/link";
import { ArrowRight, Headphones, House, Laptop, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryCard } from "@/components/common/category-card";
import { FeatureCard } from "@/components/common/feature-card";
import { MetricCard } from "@/components/common/metric-card";
import { ProductCard } from "@/components/common/product-card";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { fetchProductCategories, fetchProducts } from "@/lib/api/products";
import { formatStockStatus } from "@/lib/formatters";

const heroMetrics = [
  { value: "200+", label: "Brands stocked", helper: "Curated for Australian homes" },
  { value: "15k", label: "Orders delivered", helper: "On time in the past year" },
  { value: "4.9/5", label: "Customer rating", helper: "Across Google & ProductReview" },
];

const featureIcons = [
  <Truck key="truck" className="h-5 w-5" />,
  <Laptop key="laptop" className="h-5 w-5" />,
  <Headphones key="headphones" className="h-5 w-5" />,
];

const sellingPoints = [
  {
    title: "Australia-wide next day dispatch",
    description:
      "Orders placed before 2pm ship the same day from our Melbourne warehouse.",
  },
  {
    title: "Expert advice, real people",
    description:
      "Talk to accredited product specialists via chat, phone, or in-store.",
  },
  {
    title: "Genuine local warranty",
    description:
      "Every product includes local warranty coverage with hassle-free support.",
  },
];

const testimonials = [
  {
    name: "Samuel, Perth",
    quote:
      "Best online buying experience I have had. The gaming rig arrived calibrated with a handwritten setup guide.",
  },
  {
    name: "Priya, Brisbane",
    quote:
      "Their smart home consultation saved us hours. Everything just works and support was immediate.",
  },
  {
    name: "Melissa, Melbourne",
    quote:
      "Click and collect was ready in 30 minutes. Staff were incredibly helpful with accessories.",
  },
];

const categoryDescriptions: Record<string, string> = {
  Audio: "Headphones, speakers, and studio gear handpicked by our acoustic team.",
  Computing: "Laptops, desktops, and accessories tuned for Australian workflows.",
  Gaming: "High-refresh displays, RTX rigs, and peripherals built for marathon sessions.",
  "Smart Home": "Automate climate, lighting, and security with partner installers ready to help.",
  Entertainment: "Cinematic TVs, projectors, and surround sound bundles for any space.",
};

function slugifyCategory(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function describeCategory(name: string) {
  return (
    categoryDescriptions[name] ?? `Explore the latest ${name.toLowerCase()} releases curated by our specialists.`
  );
}


export default async function HomePage() {
  const [productList, categories] = await Promise.all([
    fetchProducts({ pageSize: 3 }),
    fetchProductCategories(),
  ]);

  const categoryCards = categories.slice(0, 4).map((name) => ({
    slug: name,
    name,
    description: describeCategory(name),
  }));

  const highlightProducts = productList.products.slice(0, 3).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description ?? undefined,
    stockStatus: formatStockStatus(product.is_available, product.is_low_stock),
    imageUrl: product.image_url,
    href: `/products/${product.id}`,
  }));

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Australia-wide shipping now live
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Elevate your tech with trusted Australian experts
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Discover cutting-edge electronics, curated bundles, and personalised recommendations backed by Melbourne-based specialists. Seamless checkout, rapid delivery, and reliable local support every step of the way.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">
                Shop the catalogue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/order-tracking">Track an order</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
  <Card className="border border-primary/20 bg-linear-to-br from-primary/5 via-background to-secondary/40">
          <CardContent className="space-y-5 p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Built for enthusiasts and everyday users alike
            </h2>
            <p className="text-sm text-muted-foreground">
              Compare devices, configure builds, and bundle installation services in one place. Our product specialists curate the store weekly so you can stay ahead without the research rabbit holes.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Laptop className="mt-0.5 h-4 w-4 text-primary" /> Custom workstation builds with thermal validation
              </li>
              <li className="flex items-start gap-2">
                <House className="mt-0.5 h-4 w-4 text-primary" /> Smart home design packages and on-site setup
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="mt-0.5 h-4 w-4 text-primary" /> Studio-grade audio gear ready for immediate delivery
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Featured categories</h2>
            <p className="text-sm text-muted-foreground">
              Handpicked lineups refreshed weekly by our buying team.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View full catalogue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((category) => (
            <CategoryCard key={slugifyCategory(category.name)} {...category} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">This week&apos;s highlights</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {highlightProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-foreground">Why shop with AWE</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {sellingPoints.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={featureIcons[index % featureIcons.length]}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-secondary/40 p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              Integrate every room, control from anywhere
            </h2>
            <p className="text-base text-muted-foreground">
              From cinema-grade lounges to energy-efficient offices, our consultants design and implement tech ecosystems that feel effortless. Schedule a complimentary planning call and leave with a blueprint tailored to your budget and timeline.
            </p>
            <Button asChild>
              <Link href="#">Book a consultation</Link>
            </Button>
          </div>
          <Card className="border border-border/60 bg-background/70">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Consultation packages include
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>On-site assessment or remote walkthrough</li>
                <li>Hardware recommendations with tiered pricing</li>
                <li>Network, security, and automation architecture</li>
                <li>Installation roadmap with partner referrals</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Loved by customers across Australia</h2>
            <p className="text-sm text-muted-foreground">
              Real stories from households and businesses upgrading with AWE.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="#">Read more reviews</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </section>

      <Separator />

      <section className="grid gap-6 rounded-2xl border border-border/80 bg-card p-6 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Ready to build your shortlist?</h3>
          <p className="text-sm text-muted-foreground">
            Create an account to sync carts across devices, book installation services, and manage warranties in one place.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/auth/register">Create account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
        <Card className="border border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-primary">
              &ldquo;Our clients trust us to deliver frictionless tech upgrades. The AWE portal lets them collaborate with our team remotely and move from quote to install in days.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-wide">— AWE Solutions Team</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
