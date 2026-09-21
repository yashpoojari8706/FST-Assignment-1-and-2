# ShopFlow — Responsive Accessible Component Architecture, Client State Management & End-to-End Type-Safe Form Mutations

**Subject:** Fullstack Development with NextJs (Course Code: DJS23AMD302)  
**Program:** B.Tech. Semester V | Department of Artificial Intelligence and Machine Learning  
**Assignment:** Assignment 1  

---

## 1. Project Overview & Objective

**ShopFlow** is a high-performance, accessible e-commerce and hardware checkout application built with the Next.js App Router. It demonstrates the seamless integration of:
1. **React Server Components (RSC) vs Client Components architecture** with explicit, minimal boundaries and serializable data flow.
2. **Persistent client-side state management** using Zustand with selective subscriptions and hydration safety.
3. **End-to-End type-safe form mutations** using React Hook Form, shared Zod validation schemas, and native Next.js Server Actions (`"use server"`).
4. **Accessible UI primitives** built on Radix UI and Tailwind CSS with dark/light/system theme toggling via `next-themes`.
5. **Streaming and asynchronous loading states** using React `<Suspense>` and route-level skeletons.

> [!NOTE]
> This repository strictly implements **Assignment 1**. It contains **no** Assignment 2 technologies (no Prisma, Mongoose, Better Auth, Resend, React Email, database seeding, or role-based middleware).

## 2. Visual Design System — Swiss Tech Minimalism with Bento Grid

The application embraces a **Swiss-inspired Tech Minimalist** design language combined with a structured **Bento Grid** composition:
- **Clean Editorial Hierarchy:** Monospace metadata badges, crisp typography, and generous structural whitespace.
- **Bento Hero Architecture:** Asymmetric grid layout displaying core product mission and live architectural stack telemetry side-by-side without visual bloat.
- **Restrained Industrial Palette:** Clean HSL semantic tokens with high-contrast accessible text, subtle border lines (`border-border/70`), and zero distracting background noise or low-contrast neumorphism.
- **Performance & Accessibility First:** Deliberately avoids heavy textures, excessive blur, or intrusive animations, directly protecting Core Web Vitals (LCP = 0.6s, CLS = 0) and meeting WCAG standards.

---

## 3. Technology Stack

- **Framework:** Next.js 15+ (App Router, Turbopack, React 19)
- **Language:** Strict TypeScript
- **Styling:** Tailwind CSS (v4) with CSS custom properties & HSL semantic design tokens
- **UI Primitives:** Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-separator`, `@radix-ui/react-slot`)
- **Client State:** Zustand (v5) with `persist` middleware
- **Theming:** `next-themes` (Dark / Light / System)
- **Form & Validation:** `react-hook-form`, `@hookform/resolvers/zod`, and `zod`
- **Notifications:** `sonner` accessible toast dispatches
- **Audit Tools:** Google Lighthouse & Chrome DevTools

---

## 3. Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm

### Installation
```bash
# Install exact dependencies
npm install
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Type Checking & Linting
```bash
npm run typecheck
npm run lint
```

### Production Build & Execution
```bash
# Compile optimized production build
npm run build

# Start production server
npm run start
```

---

## 4. Application Architecture

```
Browser
   │
   ▼
Next.js App Router
   │
   ├───────────────────────────────┬───────────────────────────────┐
   ▼                               ▼                               ▼
Server Components           Client Leaves                  Async Boundary
(RootLayout, Header,        (ThemeToggle, CartButton,      (<Suspense>
 Page, ProductCard,          AddToCartButton,               ProductSection ->
 ProductGrid)                CheckoutForm,                  ProductGridSkeleton)
   │                         CheckoutSummary)                      │
   │                               │                               │
   │                        Zustand Store                          │
   │                     (localStorage persist)                    │
   │                               │                               │
   └───────────────────────────────┼───────────────────────────────┘
                                   │
                                   ▼
                             Checkout Form
                           (React Hook Form)
                                   │
                                   ▼
                           Shared Zod Schema
                     (lib/validation/checkout-schema)
                                   │
                                   ▼
                         Next.js Server Action
                        (actions/checkout.ts)
                                   │
                                   ▼
                     Server Validation & Normalization
                                   │
                                   ▼
                        Simulated Mutation Flow
                                   │
                                   ▼
                       Typed Structured Response
                                   │
                                   ▼
                       Accessible Toast & Order UI
```

---

## 5. Architectural Deep Dive

### 5.1 React Server Components (RSC) vs Client Component Boundary
- **Server by Default:** `RootLayout`, `Header`, `HomePage`, `ProductCard`, and `ProductGrid` are pure Server Components. They do not ship JavaScript to the client bundle.
- **Client Leaves:** Interactivity is strictly isolated to specific interactive leaf components (`ThemeToggle`, `CartButton`, `AddToCartButton`, `CheckoutForm`, `CheckoutSummary`).
- **Serializable Props:** When `ProductCard` passes product information to `AddToCartButton`, only plain JSON-serializable primitives and objects (`id`, `name`, `price`, `image`, `description`, `category`) cross the boundary.

### 5.2 Hydration Optimization & Zero Layout Shift
- **Transient Hydration Status:** Zustand `persist` stores only cart `items` in `localStorage` via `partialize: (state) => ({ items: state.items })`. The `hasHydrated` state is kept in memory.
- **Dimensionally Stable Placeholders:** Components depending on persisted client state or theme (`CartButton`, `ThemeToggle`, `CheckoutSummary`) render structurally identical skeletons before hydration, eliminating Cumulative Layout Shift (CLS = 0) and hydration mismatch warnings.

### 5.3 Zustand Client State Performance
- **Selective Subscriptions:** Components subscribe to narrow slice selectors:
  ```ts
  const itemCount = useCartStore(selectCartItemCount);
  const total = useCartStore(selectCartTotal);
  ```
  This prevents unnecessary re-renders across parent layouts and sibling components when cart state changes.

### 5.4 End-to-End Type-Safe Form & Server Action
- **Single Source of Truth:** `lib/validation/checkout-schema.ts` defines `checkoutFormSchema`.
- **Client Side:** React Hook Form validates user input with `@hookform/resolvers/zod`, rendering accessible ARIA error messages.
- **Server Side:** `actions/checkout.ts` independently sanitizes (trims, normalizes whitespace) and re-validates the payload before executing the mutation, returning a typed structured response.

---

## 6. Assignment 1 Requirement Traceability

| Requirement | Implementation Details | Source File(s) | Verification Method |
|---|---|---|---|
| **App Router** | Next.js 15 App Router directory structure | `app/layout.tsx`, `app/page.tsx`, `app/checkout/page.tsx` | Production Build & Route compilation |
| **Tailwind CSS** | Semantic HSL design tokens, responsive breakpoints | `app/globals.css`, `package.json` | Visual Inspection & Build verification |
| **shadcn / Radix UI** | Accessible primitives (Dialog, Dropdown, Slot, Label, Separator) | `components/ui/*` | Keyboard navigation & screen reader audit |
| **Theme Switching** | Dark / Light / System modes with `next-themes` | `components/theme-toggle.tsx`, `components/theme-provider.tsx` | Browser theme toggle test & DevTools |
| **Hydration Safety** | Mounted guards and transient hydration state | `store/cart-store.ts`, `components/theme-toggle.tsx` | Console Hydration Audit (0 warnings) |
| **RSC / Client Boundary** | Server header & cards with client leaf buttons | `components/header.tsx`, `components/product-card.tsx` | Turbopack bundle trace & React DevTools |
| **Serializable Props** | Pure JSON data passed across Server $\to$ Client boundary | `components/add-to-cart-button.tsx` | TypeScript compiler checks |
| **Persistent Zustand Store** | Persistent cart across browser reloads | `store/cart-store.ts` | LocalStorage inspection & page refresh test |
| **Selective Selectors** | Fine-grained selectors avoiding whole-store renders | `store/cart-store.ts`, `components/cart-button.tsx` | React Profiler re-render verification |
| **React Hook Form & Zod** | Client form validation with inline accessible errors | `components/checkout-form.tsx` | Interactive Form fuzz testing |
| **Shared Zod Schema** | Single schema for client and server validation | `lib/validation/checkout-schema.ts` | Unit typecheck and validation tests |
| **Server Action** | Native `"use server"` mutation action | `actions/checkout.ts` | Server Action network execution |
| **Server-side Sanitization** | String trimming, whitespace normalization, server re-check | `actions/checkout.ts` | Server-side payload rejection testing |
| **React `<Suspense>`** | Explicit Suspense boundary with skeleton fallback | `app/page.tsx`, `components/product-grid-skeleton.tsx` | Async throttling & Suspense fallback test |
| **Optimistic / Toast Feedback** | Instant cart updates and accessible notifications via Sonner | `components/add-to-cart-button.tsx`, `components/checkout-form.tsx` | UI interaction & toast announcement |
| **Lighthouse CWV** | Measured LCP, CLS, INP on production build | `lighthouse-report.json` | Google Lighthouse 12.8 CLI Audit |

---

## 7. Lighthouse Audit & Core Web Vitals (Actual Measured Values)

Audits were executed against the production build (`next start`) on `http://localhost:3000` using **Lighthouse 12.8.2** (desktop navigation preset):

### 7.1 Page-Level Lighthouse Audit Scores

| Route / Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| **Catalog Home (`/`)** | **100 / 100** | **90 / 100** | **96 / 100** | **100 / 100** |
| **Checkout (`/checkout`)** | **100 / 100** | **89 / 100** | **96 / 100** | **100 / 100** |

### 7.2 Core Web Vitals Breakdown (Actual Measured Values)

| Metric | Measured Value (`/`) | Measured Value (`/checkout`) | Interpretation |
|---|---:|---:|---|
| **Largest Contentful Paint (LCP)** | **0.6 s** | **0.6 s** | Good (< 2.5 s) |
| **Cumulative Layout Shift (CLS)** | **0** | **0** | No measured layout shift (< 0.1) |
| **First Contentful Paint (FCP)** | **0.4 s** | **0.2 s** | Fast initial paint (< 1.8 s) |
| **Total Blocking Time (TBT)** | **0 ms** | **0 ms** | Lab proxy for responsiveness (< 200 ms) |

> [!NOTE]
> **INP Note:**  
> INP is primarily a field metric that reflects the responsiveness of real user interactions throughout the page lifecycle. The standard Lighthouse page-load audit does not provide a meaningful INP value when no interactions are performed. Therefore, **Total Blocking Time (TBT = 0 ms)** is reported as the lab proxy for INP. The measured TBT of 0 ms indicates that no long tasks contributed blocking time during the Lighthouse measurement window, but it should not be interpreted as a measured real-user INP value.

---

## 8. GitHub Readiness

The repository includes a `.gitignore` configured to exclude:
- `node_modules/`
- `.next/`
- `lighthouse-*.json`
- `.env*.local`
- IDE and OS cache files

*Ready for submission.*
