export const featuredCategories = [
  {
    slug: "computing",
    name: "Computing",
    description: "Laptops, desktops, and accessories for work and play.",
    image: "/images/categories/computing.jpg",
  },
  {
    slug: "audio",
    name: "Audio",
    description: "Premium headphones, speakers, and studio gear.",
    image: "/images/categories/audio.jpg",
  },
  {
    slug: "smart-home",
    name: "Smart Home",
    description: "Automate climate, lighting, and security effortlessly.",
    image: "/images/categories/smart-home.jpg",
  },
  {
    slug: "gaming",
    name: "Gaming",
    description: "Consoles, GPUs, and eSports-ready peripherals.",
    image: "/images/categories/gaming.jpg",
  },
];

export const featuredProducts = [
  {
    id: 1,
    name: "AWE Ultrabook X15",
    category: "Computing",
    price: 2199,
    image: "/images/products/ultrabook.jpg",
    description:
      "Featherweight aluminium chassis, 16\" display, all-day battery.",
    badge: "New Arrival",
    href: "/products/awe-ultrabook-x15",
  },
  {
    id: 2,
    name: "Pulse ANC Pro Headphones",
    category: "Audio",
    price: 449,
    image: "/images/products/headphones.jpg",
    description: "Spatial audio and adaptive noise cancelling for focus anywhere.",
    badge: "Bestseller",
    href: "/products/pulse-anc-pro-headphones",
  },
  {
    id: 3,
    name: "Nebula OLED 55\" TV",
    category: "Entertainment",
    price: 1899,
    image: "/images/products/oled-tv.jpg",
    description: "Ultra-thin 120Hz OLED with Dolby Vision IQ and Google TV.",
    badge: "Weekend Deal",
  },
];

export const catalogueProducts = [
  {
    id: 100,
    name: "AWE Ultrabook X15",
    category: "Computing",
    price: 2199,
    description: "Featherweight aluminium chassis with RTX graphics and OLED display.",
    stockStatus: "In Stock",
    rating: 4.9,
    reviews: 248,
    href: "/products/awe-ultrabook-x15",
  },
  {
    id: 101,
    name: "Vortex RTX 4070 Ti Desktop",
    category: "Computing",
    price: 3699,
    description: "Liquid-cooled 13th Gen i9 build with Wi-Fi 7 and 4TB NVMe storage.",
    stockStatus: "In Stock",
    rating: 4.9,
    reviews: 184,
  },
  {
    id: 102,
    name: "NovaBook Air 13",
    category: "Computing",
    price: 1899,
    description: "Magnesium chassis, OLED panel, and instant wake biometrics.",
    stockStatus: "Low Stock",
    rating: 4.7,
    reviews: 92,
  },
  {
    id: 103,
    name: "Pulse ANC Pro Headphones",
    category: "Audio",
    price: 449,
    description: "Spatial audio and adaptive noise cancelling for focus anywhere.",
    stockStatus: "In Stock",
    rating: 4.8,
    reviews: 612,
    href: "/products/pulse-anc-pro-headphones",
  },
  {
    id: 104,
    name: "Resonance Studio Monitors (Pair)",
    category: "Audio",
    price: 1199,
    description: "Bi-amped nearfields tuned for Melbourne mastering suites.",
    stockStatus: "Pre-Order",
    rating: 4.6,
    reviews: 48,
  },
  {
    id: 105,
    name: "Nebula OLED 65\" TV",
    category: "Entertainment",
    price: 2799,
    description: "Micro-bezel 4K OLED with Dolby Atmos soundbar bundle.",
    stockStatus: "In Stock",
    rating: 4.9,
    reviews: 305,
  },
  {
    id: 106,
    name: "Auralink 7.2 AVR",
    category: "Entertainment",
    price: 1599,
    description: "HDMI 2.1 switching and Dirac Live room correction built-in.",
    stockStatus: "In Stock",
    rating: 4.5,
    reviews: 124,
  },
  {
    id: 107,
    name: "Orbit Smart Thermostat",
    category: "Smart Home",
    price: 399,
    description: "Self-learning climate schedules with Matter and HomeKit support.",
    stockStatus: "In Stock",
    rating: 4.4,
    reviews: 87,
  },
  {
    id: 108,
    name: "Lumen Mesh Lighting Starter Kit",
    category: "Smart Home",
    price: 629,
    description: "Dynamic RGBW lighting scenes with Australian-certified installers.",
    stockStatus: "Low Stock",
    rating: 4.6,
    reviews: 133,
  },
  {
    id: 109,
    name: "Sentinel Pro Security Bundle",
    category: "Smart Home",
    price: 899,
    description: "8-channel 4K NVR, outdoor PTZ cameras, and cellular backup hub.",
    stockStatus: "In Stock",
    rating: 4.8,
    reviews: 211,
  },
  {
    id: 110,
    name: "AWE Pro Streaming Kit",
    category: "Gaming",
    price: 749,
    description: "Capture card, broadcast mic, and key lighting for creators.",
    stockStatus: "In Stock",
    rating: 4.7,
    reviews: 166,
  },
  {
    id: 111,
    name: "HyperDrive eSports Chair",
    category: "Gaming",
    price: 499,
    description: "Memory foam bolstering with cooling fabric and 4D armrests.",
    stockStatus: "Low Stock",
    rating: 4.3,
    reviews: 74,
  },
];

export const catalogueFilters = {
  categories: [
    { label: "All", value: "all" },
    { label: "Computing", value: "Computing" },
    { label: "Audio", value: "Audio" },
    { label: "Entertainment", value: "Entertainment" },
    { label: "Smart Home", value: "Smart Home" },
    { label: "Gaming", value: "Gaming" },
  ],
  priceRanges: [
    { label: "Under $500", value: "under-500" },
    { label: "$500 - $1500", value: "500-1500" },
    { label: "$1500 - $3000", value: "1500-3000" },
    { label: "Above $3000", value: "above-3000" },
  ],
  sort: [
    { label: "Recommended", value: "recommended" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Customer Rating", value: "rating" },
    { label: "Newest", value: "newest" },
  ],
};

export const sellingPoints = [
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

export const testimonials = [
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

export type ProductHighlight = {
  title: string;
  description: string;
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type ProductService = {
  title: string;
  description: string;
};

export type ProductShipping = {
  leadTime: string;
  details: string[];
};

export type RelatedProduct = {
  id: number | string;
  name: string;
  category: string;
  price: number;
  description?: string;
  badge?: string;
  stockStatus?: string;
  rating?: number;
  reviews?: number;
  href?: string;
};

export type DetailedProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockStatus: string;
  rating?: number;
  reviews?: number;
  summary: string;
  description: string;
  gallery: string[];
  highlights: ProductHighlight[];
  specifications: ProductSpecification[];
  inTheBox: string[];
  warranty: string;
  shipping: ProductShipping;
  services?: ProductService[];
  relatedProducts?: RelatedProduct[];
};

export type CartLineItem = {
  id: string;
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  stockStatus?: string;
  availabilityMessage?: string;
};

export type CartSummary = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  savings?: number;
};

export type CheckoutContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingOptIn: boolean;
};

export type CheckoutAddress = {
  id: string;
  label: string;
  contactName: string;
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
  instructions?: string;
  isDefault?: boolean;
};

export type ShippingOption = {
  id: string;
  label: string;
  description: string;
  eta: string;
  price: number;
  recommended?: boolean;
};

export type PaymentMethodPreview = {
  id: string;
  type: "card" | "paypal" | "afterpay";
  label: string;
  hint: string;
  surcharge?: number;
};

export type CheckoutSupportMessage = {
  title: string;
  description: string;
  href?: string;
};

export type TrackingStatus = "processing" | "packed" | "in_transit" | "delivered";

export type OrderTrackingEvent = {
  status: TrackingStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
};

export type OrderPackageItem = {
  name: string;
  quantity: number;
  sku?: string;
};

export type OrderTrackingInfo = {
  orderNumber: string;
  placedAt: string;
  status: TrackingStatus;
  eta: string;
  customer: {
    name: string;
    email: string;
  };
  shippingAddress: string;
  carrier: {
    name: string;
    trackingNumber: string;
    supportUrl: string;
  };
  events: OrderTrackingEvent[];
  items: OrderPackageItem[];
  summary: CartSummary;
  notes: string[];
};

export const detailedProducts: Record<string, DetailedProduct> = {
  "awe-ultrabook-x15": {
    id: "awe-ultrabook-x15",
    name: "AWE Ultrabook X15",
    sku: "AE-UX15-2025",
    category: "Computing",
    price: 2199,
    stockStatus: "In Stock",
    rating: 4.9,
    reviews: 248,
    summary:
      "Featherweight 16-inch workstation with Intel Core Ultra, RTX graphics, and 18-hour battery life.",
    description:
      "Designed for hybrid professionals, the Ultrabook X15 pairs aerospace-grade aluminium with next-gen thermals. Work in 4K, compile code, and render creative projects without throttling.",
    gallery: [
      "/images/products/ultrabook/hero.jpg",
      "/images/products/ultrabook/side.jpg",
      "/images/products/ultrabook/keyboard.jpg",
      "/images/products/ultrabook/ports.jpg",
    ],
    highlights: [
      {
        title: "Intel Core Ultra 9",
        description: "AI-accelerated workloads handled by dedicated NPU cores.",
      },
      {
        title: "RTX 4070 Laptop GPU",
        description: "Certified for Adobe, Autodesk, and Unreal Engine pipelines.",
      },
      {
        title: "Calibrated Nebula Display",
        description: "16\" 120Hz OLED with 100% DCI-P3 coverage out of the box.",
      },
      {
        title: "All-day battery",
        description: "Up to 18 hours of real-world use with 100W USB-C charging.",
      },
    ],
    specifications: [
      { label: "Processor", value: "Intel Core Ultra 9 285H" },
      { label: "Graphics", value: "NVIDIA GeForce RTX 4070 8GB" },
      { label: "Memory", value: "32GB LPDDR5X 6400MHz" },
      { label: "Storage", value: "2TB PCIe Gen 4 NVMe SSD" },
      { label: "Display", value: "16\" 3200×2000 OLED, 120Hz" },
      { label: "Ports", value: "2× Thunderbolt 4, HDMI 2.1, 2× USB-A, SD Express" },
      { label: "Wireless", value: "Wi-Fi 7, Bluetooth 5.4" },
      { label: "Weight", value: "1.45 kg" },
    ],
    inTheBox: [
      "AWE Ultrabook X15",
      "100W USB-C GaN charger",
      "Travel sleeve",
      "Colour calibration report",
    ],
    warranty: "3-year premium onsite support (upgradeable to 5 years).",
    shipping: {
      leadTime: "Dispatches within 24 hours",
      details: [
        "Free insured express shipping Australia-wide",
        "Click & Collect available from Melbourne HQ",
        "Installation and data migration optional at checkout",
      ],
    },
    services: [
      {
        title: "Consult with a workstation specialist",
        description: "Schedule a 30-minute remote session to tailor the build to your pipelines.",
      },
      {
        title: "Onsite deployment",
        description: "Certified engineers deliver, image, and benchmark your device in person.",
      },
    ],
    relatedProducts: [
      {
        id: 102,
        name: "NovaBook Air 13",
        category: "Computing",
        price: 1899,
        description: "Ultra-portable OLED daily driver with instant wake.",
        badge: "Low Stock",
        stockStatus: "Low Stock",
        rating: 4.7,
        reviews: 92,
        href: "/products",
      },
      {
        id: 107,
        name: "Orbit Smart Thermostat",
        category: "Smart Home",
        price: 399,
        description: "Automated climate control with Matter support.",
        stockStatus: "In Stock",
        rating: 4.4,
        reviews: 87,
        href: "/products",
      },
      {
        id: 110,
        name: "AWE Pro Streaming Kit",
        category: "Gaming",
        price: 749,
        description: "Creator-ready camera, mic, and lighting bundle.",
        stockStatus: "In Stock",
        rating: 4.7,
        reviews: 166,
        href: "/products",
      },
    ],
  },
  "pulse-anc-pro-headphones": {
    id: "pulse-anc-pro-headphones",
    name: "Pulse ANC Pro Headphones",
    sku: "PL-ANC-PRO",
    category: "Audio",
    price: 449,
    stockStatus: "In Stock",
    rating: 4.8,
    reviews: 612,
    summary:
      "Studio-grade sound with adaptive noise cancelling tuned for Australian commuters and audio engineers.",
    description:
      "Pulse ANC Pro blends premium drivers with an adaptive transparency mode so you can master tracks or take calls on the go. Now featuring Bluetooth LE Audio and dual-device pairing.",
    gallery: [
      "/images/products/headphones/hero.jpg",
      "/images/products/headphones/case.jpg",
      "/images/products/headphones/cushions.jpg",
    ],
    highlights: [
      {
        title: "Hybrid ANC with 6 microphones",
        description: "Automatically adjusts to aircraft, office, or street noise.",
      },
      {
        title: "40-hour battery life",
        description: "10-minute quick charge delivers 6 hours of playback.",
      },
      {
        title: "Studio reference tuning",
        description: "Verified on Melbourne mastering rigs with ±1dB accuracy between 20Hz-20kHz.",
      },
    ],
    specifications: [
      { label: "Drivers", value: "42mm beryllium-coated dynamic" },
      { label: "Connectivity", value: "Bluetooth 5.4 LE Audio, USB-C" },
      { label: "Codecs", value: "AAC, aptX Adaptive, LC3" },
      { label: "Weight", value: "280 g" },
      { label: "Battery", value: "40 hrs ANC on, 60 hrs ANC off" },
      { label: "Microphones", value: "6 beamforming mics + bone conduction" },
    ],
    inTheBox: [
      "Pulse ANC Pro Headphones",
      "Hard-shell travel case",
      "USB-C charging cable",
      "3.5mm studio cable",
      "Flight adapter",
    ],
    warranty: "2-year replacement warranty with loan unit service.",
    shipping: {
      leadTime: "Ready for same-day dispatch",
      details: [
        "Free express shipping on audio orders over $200",
        "Try at the Melbourne listening lounge by appointment",
      ],
    },
    services: [
      {
        title: "Custom EQ session",
        description: "Audio engineer tunes profiles for your DAW of choice.",
      },
    ],
    relatedProducts: [
      {
        id: 104,
        name: "Resonance Studio Monitors (Pair)",
        category: "Audio",
        price: 1199,
        description: "Bi-amped nearfields engineered in Melbourne.",
        stockStatus: "Pre-Order",
        rating: 4.6,
        reviews: 48,
        href: "/products",
      },
      {
        id: 108,
        name: "Lumen Mesh Lighting Starter Kit",
        category: "Smart Home",
        price: 629,
        description: "Studio lighting scenes with Matter support.",
        stockStatus: "Low Stock",
        rating: 4.6,
        reviews: 133,
        href: "/products",
      },
    ],
  },
};

export const mockCart: {
  items: CartLineItem[];
  summary: CartSummary;
  upsell: RelatedProduct[];
  messages: string[];
} = {
  items: [
    {
      id: "cart-item-1",
      productId: "awe-ultrabook-x15",
      name: "AWE Ultrabook X15",
      category: "Computing",
      image: "/images/products/ultrabook/hero.jpg",
      price: 2199,
      quantity: 1,
      stockStatus: "In Stock",
      availabilityMessage: "Dispatches within 24 hours",
    },
    {
      id: "cart-item-2",
      productId: "pulse-anc-pro-headphones",
      name: "Pulse ANC Pro Headphones",
      category: "Audio",
      image: "/images/products/headphones/hero.jpg",
      price: 449,
      quantity: 2,
      stockStatus: "In Stock",
      availabilityMessage: "Free express shipping eligible",
    },
  ],
  summary: {
    subtotal: 3097,
    shipping: 0,
    tax: 282,
    total: 3379,
    savings: 120,
  },
  upsell: [
    {
      id: 108,
      name: "Lumen Mesh Lighting Starter Kit",
      category: "Smart Home",
      price: 629,
      description: "Studio lighting scenes with Matter support.",
      stockStatus: "Low Stock",
      rating: 4.6,
      reviews: 133,
      href: "/products",
    },
    {
      id: 110,
      name: "AWE Pro Streaming Kit",
      category: "Gaming",
      price: 749,
      description: "Creator-ready camera, mic, and lighting bundle.",
      stockStatus: "In Stock",
      rating: 4.7,
      reviews: 166,
      href: "/products",
    },
  ],
  messages: [
    "You qualify for free Australia-wide express shipping.",
    "Bundle installation services at checkout for discounted rates.",
  ],
};

export const mockCheckout = {
  contact: {
    firstName: "Jordan",
    lastName: "Nguyen",
    email: "jordan.nguyen@example.com",
    phone: "+61 3 5550 1234",
    marketingOptIn: true,
  } as CheckoutContact,
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      contactName: "Jordan Nguyen",
      line1: "12 Lygon Street",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      instructions: "Leave at reception if unattended",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Studio",
      contactName: "Jordan Nguyen",
      line1: "Level 5, 120 Spencer Street",
      suburb: "Docklands",
      state: "VIC",
      postcode: "3008",
    },
  ] as CheckoutAddress[],
  shippingOptions: [
    {
      id: "express",
      label: "Express courier",
      description: "Insured overnight delivery from Melbourne warehouse",
      eta: "Arrives Thu 7 Nov",
      price: 0,
      recommended: true,
    },
    {
      id: "standard",
      label: "Standard shipping",
      description: "2-4 business days via Australia Post",
      eta: "Arrives Mon 10 Nov",
      price: 15,
    },
    {
      id: "collect",
      label: "Click & Collect",
      description: "Pick up from Melbourne HQ (same day)",
      eta: "Ready within 2 hours",
      price: 0,
    },
  ] as ShippingOption[],
  paymentMethods: [
    {
      id: "visa-1234",
      type: "card",
      label: "Visa ending 1234",
      hint: "Expires 08/27",
    },
    {
      id: "afterpay",
      type: "afterpay",
      label: "Afterpay",
      hint: "4 fortnightly payments of $844.75",
    },
    {
      id: "paypal",
      type: "paypal",
      label: "PayPal",
      hint: "Checkout with your PayPal account",
    },
  ] as PaymentMethodPreview[],
  summary: {
    ...mockCart.summary,
    shipping: 0,
    total: mockCart.summary.total,
  } as CartSummary,
  support: [
    {
      title: "Need installation help?",
      description: "Add professional setup and calibration in the next step.",
      href: "/consultations",
    },
    {
      title: "GST invoice required?",
      description: "We issue ABN-compliant invoices instantly after payment.",
    },
  ] as CheckoutSupportMessage[],
};

export const mockOrderTracking: OrderTrackingInfo = {
  orderNumber: "AE-45821",
  placedAt: "2025-11-01T09:32:00+11:00",
  status: "in_transit",
  eta: "Arriving Thu 7 Nov",
  customer: {
    name: "Jordan Nguyen",
    email: "jordan.nguyen@example.com",
  },
  shippingAddress: "12 Lygon Street, Carlton VIC 3053",
  carrier: {
    name: "AUS Express Logistics",
    trackingNumber: "AUS123456789",
    supportUrl: "https://aus-express.example.com/track/AUS123456789",
  },
  events: [
    {
      status: "processing",
      title: "Order confirmed",
      description: "Payment verified and line items reserved in inventory.",
      timestamp: "2025-11-01T09:35:00+11:00",
      location: "AWE HQ, Melbourne",
    },
    {
      status: "packed",
      title: "Packed & quality checked",
      description: "Technician completed thermal validation and accessory checklist.",
      timestamp: "2025-11-02T12:10:00+11:00",
      location: "AWE Fulfilment Centre",
    },
    {
      status: "in_transit",
      title: "With courier",
      description: "Parcel collected by AUS Express Logistics and scanned at depot.",
      timestamp: "2025-11-03T18:45:00+11:00",
      location: "Tullamarine Depot",
    },
  ],
  items: [
    { name: "AWE Ultrabook X15", quantity: 1, sku: "AE-UX15-2025" },
    { name: "Pulse ANC Pro Headphones", quantity: 1, sku: "PL-ANC-PRO" },
  ],
  summary: {
    subtotal: 2648,
    shipping: 0,
    tax: 240,
    total: 2888,
  },
  notes: [
    "Technician installed requested software bundle and generated calibration report.",
    "Signature required upon delivery. Courier will contact 30 minutes prior.",
  ],
};
