## AWE Electronics Frontend Architecture

This document captures how the AWE Electronics storefront is structured on the frontend and how it communicates with the FastAPI backend. The focus is on architecture, data flow, and design decisions made while replacing all mock data with live API integrations.

---

## 1. Technology Stack

| Layer              | Technology                                                | Purpose                                                                    |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router)                                   | Hybrid server/client rendering, routing, server actions                    |
| UI Runtime         | React 19                                                  | Client interactivity with modern features (transitions, server components) |
| Styling            | Tailwind CSS 4, custom utility wrappers                   | Consistent design tokens and responsive layout                             |
| Icons & Primitives | `lucide-react`, Radix-style UI wrappers (`components/ui`) | Accessible components reused across flows                                  |
| API Communication  | Native `fetch` + typed wrappers (`lib/api`)               | Strongly typed requests/responses with shared session handling             |

Server components are used wherever possible to fetch data before render; client components are reserved for interactive pieces (forms, dropdowns, quantity pickers). This balance keeps the critical UI fast while still enabling rich user interactions.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ next/app router (app/(public)/...)                               │
│   ├─ server component route handlers                              │
│   │    └─ call lib/api/* wrappers                                 │
│   │         └─ apiFetch (injects session, handles errors)         │
│   └─ pass serialisable data into client components                 │
│           └─ components/* render UI & manage local state          │
└──────────────────────────────────────────────────────────────────┘
```

- **Routing layer** (`app/(public)/...`) controls data loading. Each page coordinates async calls to the backend and massages payloads into view models.
- **API layer** (`lib/api/*`) supplies typed functions for each backend endpoint. The shared `apiFetch` helper adds the session cookie, default headers, retry-friendly defaults, and consistent error objects.
- **Presentation layer** (`components/*`) contains reusable pieces. Client components own transient state (form inputs, dropdown selections) and call supplied callbacks that trigger server actions when mutations are needed.
- **Type definitions** (`lib/types/api.ts`) mirror FastAPI schemas so TypeScript catches mismatches during development.

All data now flows from the backend; the previous mocks have been removed to avoid divergence between environments.

---

## 3. API Session & Error Handling

`lib/api/server.ts` is the foundation for every network request:

- Generates or reuses an `awe-session-id` cookie per visitor using `next/headers`. This ID is forwarded through the `X-Session-ID` header so the FastAPI cart endpoints tie to the same shopper across requests.
- Accepts optional query parameters, request bodies, and auth tokens. Query objects are serialised once to avoid repetition inside individual API modules.
- Wraps non-2xx responses in a custom `ApiError` that includes HTTP status, status text, and the parsed backend payload. Pages inspect this error to decide whether to show empty states (e.g., cart not found) or surface backend validation messages (e.g., checkout failures).
- Sets `cache: 'no-store'` by default because cart and checkout data must always be fresh; pages can override this if future endpoints should be cached.

This abstraction keeps pages declarative: they call `fetchCart()` or `fetchTracking(...)` and handle results without reimplementing fetch logic.

---

## 4. Routing & Page Responsibilities

### 4.1 Catalogue (`app/(public)/products` and `/products/[id]`)

- Server components fetch product lists and categories via `fetchProducts`/`fetchProductById`.
- Responses are projected into lightweight view models (id, name, description, formatted availability) before hitting the client.
- `formatStockStatus` centralises messaging for `is_available` and `is_low_stock`, keeping UI wording consistent.

### 4.2 Home (`app/(public)/page.tsx`)

- Builds hero sections and curated product grids from backend calls.
- Demonstrates the pattern of combining multiple `Promise.all` calls to minimise waterfall latency.

### 4.3 Cart (`app/(public)/cart/page.tsx`)

- Server component loads the cart, gracefully handling a 404 (no cart yet) by showing an empty state.
- For populated carts it enriches line items with additional product metadata (images, categories) by calling `fetchProductById` in parallel.
- The resulting array is passed to the `CartLineItem` client component, which renders interactive quantity selectors. Quantity selection triggers callbacks provided by the page; these callbacks will later wire into server actions for live cart updates.
- The summary sidebar calculates totals using the backend’s authoritative numbers to avoid mismatches.

### 4.4 Checkout (`app/(public)/checkout/page.tsx` + `components/checkout/checkout-flow.tsx`)

- Server side: verifies the cart exists, preloads suggested upsell items, and constructs shipping/payment option lists.
- Defines a server action `placeOrder` that validates the payload before calling `submitCheckout`. This ensures client-side tampering (missing fields) is caught even if JavaScript validation is bypassed.
- Client side (`CheckoutFlow`): orchestrates form state for contact, address, shipping, payment, and optional notes. It uses `React.useTransition` when posting to keep the UI responsive and surfaces backend errors inline.
- The component hierarchy divides concerns: contact/address/payment sections each encapsulate their inputs, making it easy to evolve individual steps without touching the primary flow.

### 4.5 Order Tracking (`app/(public)/order-tracking/page.tsx`)

- Server component accepts `order` and `email` query params. It displays a lookup form and runs `fetchTracking` when both fields are present.
- Success responses feed the status badge, timeline, and summary cards. Status codes from the API are normalised (e.g., `"Out for Delivery"` → `OUT_FOR_DELIVERY`) before rendering.
- If the backend returns 404, the page renders a dedicated error panel with guidance, rather than a generic toast.

---

## 5. Component Design Patterns

### Client vs Server Boundaries

- Client components are explicitly marked with `"use client"` and kept as leaf nodes wherever possible (e.g., `CartLineItem`, `CheckoutFlow`). This minimises hydration cost because most data assembly happens on the server.
- Server components (`page.tsx` files) never import browser-only APIs. They focus on fetching and shaping data, then hand off serialisable props to client components.

### State Management & Transitions

- Local component state uses React hooks (e.g., `useState`, `useEffect`) for form inputs and quantity selectors.
- `CheckoutFlow` wraps async submission in `useTransition` to avoid blocking the UI; pending state toggles button copy and disables actions.
- No global client-side store is required because each interaction revalidates data via server actions or direct fetches. This keeps business logic close to the components that need it.

### Validation Strategy

- Client-side validation provides immediate feedback (e.g., required fields highlighted in checkout forms).
- Server-side validation in the `placeOrder` server action guarantees the payload matches backend expectations even if the browser validation is bypassed. Errors return structured messages that display inline.

### UI Composition

- Layout primitives (`Card`, `Badge`, `Button`, `Select`, etc.) live under `components/ui` so features share the same building blocks. Each wraps a Radix primitive or vanilla element with Tailwind classes, keeping styling consistent.
- Feature-level components (cart, checkout, tracking) compose these primitives and expose narrow props to keep them predictable and testable.

---

## 6. End-to-End Data Flow

### 6.1 Cart Lifecycle

1. `CartPage` calls `fetchCart()` to obtain the current shopper’s cart using the session header. A missing cart yields a 404 which is translated into the empty-state view.
2. When items exist, the page enriches them with product metadata (`fetchProductById`) to display images and availability badges without duplicating backend logic.
3. The derived array feeds `CartLineItem` instances. Callback props (`onQuantityChange`, `onRemove`, `onSaveForLater`) are stubs today and are ready to be connected to server actions that call `updateCartItem`/`removeCartItem` for real-time updates.
4. `CartSummaryPanel` receives the backend’s subtotal/tax/shipping calculations directly so the UI reflects backend business rules.

### 6.2 Checkout Submission

1. `CheckoutPage` ensures the cart is still populated. If not, it redirects to `/cart` to prevent orphaned checkout sessions.
2. The page prepares contextual data (upsell list, support messaging) and passes it to `CheckoutFlow`.
3. On submit, `CheckoutFlow` assembles a `CheckoutSubmissionPayload` and invokes the server action `placeOrder`.
4. The server action maps the UI payload to the FastAPI schema, calls `submitCheckout`, and returns either `{ success: true, orderNumber }` or `{ success: false, message }`.
5. The client displays inline success/error feedback; successful orders can later trigger navigation to a confirmation page.

### 6.3 Order Tracking Retrieval

1. Users provide `order` and `email` via the search form rendered by `OrderTrackingPage`.
2. The server component calls `fetchTracking(order, email)`; the shared session header is not required because tracking is open to guests.
3. A successful response is transformed into UI-friendly structures (normalised status keys, formatted timestamps) and piped into `TrackingTimeline` and `TrackingStatusBadge`.
4. API errors bubble up as `ApiError`. A 404 becomes a user-friendly explanation encouraging contact with support; other errors reuse the message supplied by the backend.

---

## 7. Directory Layout & Key Modules

```
app/
└─ (public)/
	 ├─ page.tsx                # Home
	 ├─ products/page.tsx       # Catalogue listing
	 ├─ products/[id]/page.tsx  # Product detail
	 ├─ cart/page.tsx           # Cart overview (server component)
	 ├─ checkout/page.tsx       # Checkout data loader + server action
	 └─ order-tracking/page.tsx # Tracking lookup + results

components/
├─ cart/                      # CartLineItem, CartSummaryPanel, etc.
├─ checkout/                  # Step components + CheckoutFlow orchestrator
├─ tracking/                  # Timeline, status badge, package summary
├─ catalogue/, product/       # Shared merchandised components
└─ ui/                        # Primitive wrappers built on Tailwind/Radix

lib/
├─ api/
│  ├─ server.ts               # Session-aware fetch helper + ApiError
│  ├─ products.ts             # Product list/detail calls
│  ├─ cart.ts                 # Cart CRUD helpers
│  ├─ checkout.ts             # Checkout submission helper
│  └─ tracking.ts             # Order tracking request helper
├─ types/api.ts               # DTO contracts mirrored from FastAPI
└─ formatters.ts              # Currency/stock-status formatting utilities
```

This structure keeps domain-specific logic close to the features that consume it while sharing low-level utilities in `lib/`.

---

## 8. Environment & Build Essentials

Only the essentials needed to run or adjust the frontend are captured here:

- **API base URL**: configure `.env.local` with `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/api` if omitted).
- **Install dependencies**:
  ```bash
  pnpm install
  ```
- **Run the dev server**:
  ```bash
  pnpm dev
  ```
- **Build for production**:
  ```bash
  pnpm build
  pnpm start
  ```
- **Lint**:
  ```bash
  pnpm lint
  ```

These commands rely on Node.js 20+ and pnpm 9.x. Adjust package manager commands if you standardise on npm or yarn.
