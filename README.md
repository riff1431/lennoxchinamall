# 🇨🇳 Lennox ChinaMall — Direct Factory Sourcing & E-Commerce Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)
![Binance Pay](https://img.shields.io/badge/Binance_Pay-USDT_Settlement-F0B90B?style=for-the-badge&logo=binance)

**Direct-to-consumer e-commerce portal connecting international buyers with verified Chinese manufacturers across Shenzhen, Ningbo, Dongguan, and Guangzhou.**

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Project Structure](#-project-structure) • [Admin OS](#-admin-operations--sourcing-os)

</div>

---

## 🌟 Key Features

### 🛍️ High-Conversion Storefront (Banggood / AliExpress Inspired)
- **3-Column Hero Section**: Sourcing directory flyout + interactive banner carousel + VIP Buyer Hub.
- **Smart Predictive Search**: Category selector, hot search tags, live thumbnail suggestions with USDT pricing.
- **Dynamic Category Mega Menu**: Multi-level flyout with factory guarantees and direct sourcing links.
- **Optimized Product Cards**: 1:1 image aspect ratios, discount ribbons, dual-video indicators (`🎥 2 Videos`), sold counters, and instant quick-add to cart.
- **Product Details Page (PDP)**:
  - High-res image gallery with interactive thumbnail selector and zoom modal.
  - **Dual Video Showcase**: Dedicated slots for Factory QC Stress Tests & 4K Hardware Demos.
  - Live variant selection (Color, Specification, Plug Type) with dynamic price calculation.
  - Real-time stock counters, factory audit badges, verified customer reviews, and shipping FAQs.

### 💳 Crypto-Native Checkout (Binance Pay USDT)
- **Slide-in Cart Drawer**: Live free air-shipping progress bar, dynamic voucher engine (`LENNOX10`, `USDT5`), and auto USDT calculations.
- **3-Step Frictionless Checkout**:
  1. *Destination & DDP Customs*: Complete destination handling with tax & duty pre-clearance.
  2. *Carrier Selection*: Standard Air Express vs. Priority DHL/FedEx.
  3. *Instant Binance Pay Settlement*: Dynamic QR code generation, 30-minute expiration countdown, and secure webhook verification.

### 📦 Logistics & Customer Account Hub
- **Air Freight Tracker**: 5-step live shipment tracker (`USDT Paid` → `QC Passed` → `Flight CX872` → `Customs Clearance` → `Delivered`).
- **Buyer Dashboard**: VIP tier status, order history, address manager, wishlist with 1-click cart transfer, and RMA warranty claims.

### ⚙️ Admin Operations & Sourcing OS
- **Executive Analytics**: Gross USDT volume, active shipments, settled order counter, and net sourcing margin metrics.
- **Sourcing Queue**: Maps customer orders to secret 1688 / factory acquisition codes (`SUP-GZ-4419`) for one-click PO fulfillment.
- **Catalog & Inventory Suite**: Comprehensive product & variant manager, dual-video slot configuration, secret cost margins, attribute management, and bulk CSV export.
- **Security & Audit Logs**: Detailed audit trail for catalog modifications, inventory adjustments, and status transitions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons + Google Fonts (Montserrat) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://greensock.com/gsap/) + [Lenis](https://lenis.darkroom.engineering/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (Persistent Cart & Wishlist stores) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, RLS Policies, SSR Auth, Triggers) |
| **Payments** | Binance Pay API (HMAC-SHA512 Webhook Signing, USDT Settlement) |
| **Form Validation** | React Hook Form + Zod |

---

## 📁 Project Structure

```text
lennoxchinamall/
├── public/                    # Static assets, banners, icons, and logos
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── (store)/           # Storefront routes (Home, Products, Categories, Cart, Checkout)
│   │   ├── admin/             # Admin OS (Analytics, Products, Sourcing, Orders, Inventory)
│   │   ├── api/               # API routes (Binance Webhooks, Notifications, Auth Callbacks)
│   │   ├── layout.tsx         # Root layout with fonts, metadata, and providers
│   │   └── globals.css        # Tailwind CSS v4 & theme variables
│   ├── components/            # Reusable UI & Business components
│   │   ├── admin/             # Admin tables, forms, modals, and metric cards
│   │   ├── cart/              # Slide-in cart drawer & items list
│   │   ├── layout/            # Navbar, Header, MegaMenu, Footer, SearchBar
│   │   ├── product/           # Product cards, DualVideoPlayer, VariantSelector, PDP Gallery
│   │   └── ui/                # Base UI elements (buttons, inputs, badges, modals)
│   ├── lib/                   # Utility functions & service integrations
│   │   ├── supabase/          # Supabase browser, server, and middleware clients
│   │   ├── binance.ts         # Binance Pay API client & webhook signature verification
│   │   ├── notifications/     # Notification dispatcher & email template engine
│   │   └── store/             # Zustand persistent state stores (Cart, Wishlist)
│   ├── types/                 # TypeScript interfaces and domain schemas
│   └── middleware.ts          # Edge authentication & route protection middleware
├── supabase/                  # Supabase migrations, seed data, and schema definitions
├── .env.example               # Environment variables template
└── next.config.ts             # Next.js compiler and image remote patterns configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.9.0` or higher
- **Package Manager**: `npm` (v9+) / `pnpm` / `yarn`

### 2. Installation
```bash
# Clone repository
git clone https://github.com/riff1431/lennoxchinamall.git
cd lennoxchinamall

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local` and populate your credentials:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
# Compile and optimize production bundle
npm run build

# Start production server
npm run start
```

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|---|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / public key | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| Supabase publishable client key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Backend / Admin only) | Yes |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (e.g. `http://localhost:3000` or production domain) | Yes |
| `BINANCE_API_KEY` | Binance Pay Merchant API Key | Optional for Dev |
| `BINANCE_API_SECRET` | Binance Pay Merchant API Secret | Optional for Dev |
| `RESEND_API_KEY` | Resend API key for order & notification emails | Optional |

---

## 🎨 Design Palette

| Token | Hex | Usage |
|---|---|---|
| **Navy Brand** | `#00143D` | Primary headers, mega menu top bar, dark surface |
| **Lennox Red** | `#FF1028` | Primary CTA, flash deals, badges, countdown timers |
| **USDT Emerald** | `#10B981` | Binance Pay badges, verified icons, margin indicators |
| **Clean White** | `#FFFFFF` | Storefront surfaces, card containers, high contrast |

---

## 📜 License

Private and proprietary. Copyright © 2026 Lennox ChinaMall. All rights reserved.
