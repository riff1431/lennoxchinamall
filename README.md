# Lennox ChinaMall — Direct China Sourcing & E-Commerce Platform

> **Lennox ChinaMall** is a direct-to-consumer e-commerce portal connecting international buyers with verified Chinese manufacturers in Shenzhen, Ningbo, Dongguan, and Guangzhou. Features zero-fee **Binance Pay USDT** cryptocurrency settlement, private supplier code routing, and live air cargo tracking.

---

## 🌟 Key Features

### 🛍️ Storefront Experience (Banggood / AliExpress Inspired)
- **Multi-Zone Dynamic Homepage**: 3-column Hero section (Sourcing directory + Hero carousel banner + VIP Buyer Hub), category shortcuts, flash deals with live countdown timers & claim bars, trending hardware tabs, and direct China factory cluster guides.
- **Large Smart Search Bar**: Category department selector, hot keyword tags, and predictive search suggestions with product thumbnails and USDT pricing.
- **Category Mega Menu**: Multi-column flyout with department shortcuts, subcategory grids, and factory guarantees.
- **Upgraded Product Cards**: 1:1 consistent image ratios, Lennox Red (`#FF1028`) discount ribbons, demo video indicators (`🎥 2 Videos`), rating breakdown, sold counters, price savings breakdown, and quick-add actions with animated feedback.
- **Product Details Page (PDP)**:
  - Premium image gallery with fullscreen zoom modal and thumbnail carousel.
  - Dedicated **Dual Video Module** on the right (Slot 1: Factory Quality Test, Slot 2: 4K Flight & Hardware Demo).
  - Interactive variant selection pills with live price recalculation and quantity stepper.
  - Sticky bottom action bar with quick *Add to Cart* and *Buy Now with USDT* buttons.
  - Tabbed specifications, factory inspection notes, verified customer reviews, and shipping FAQs.

### 💳 Cart & Checkout (Binance Pay USDT Integration)
- **Slide-in Cart Drawer**: Free air shipping progress bar, editable steppers, preset vouchers (`LENNOX10`, `USDT5`), and auto USDT totals.
- **3-Step Checkout Flow**:
  1. *Destination & Contact Details* (DDP customs handled).
  2. *Air Cargo Carrier Selection* (Standard Air Express vs Priority DHL/FedEx).
  3. *Binance Pay USDT Settlement* with unique Order Number, Merchant Trade No, Prepay ID, scannable QR code, 30-minute timer, and real-time status simulator.

### 👤 Customer Account Portal
- Overview dashboard with VIP buyer status, active shipment tracker, metric cards, order activity notifications feed, and recently viewed hardware.
- Real-time 5-step air freight timeline (`USDT Paid` → `QC Checked` → `Air Flight CX872` → `Customs Clearance` → `Delivered`).
- Profile & Security settings, shipping addresses management modal, wishlist with *Move to Cart*, verified review submissions, 24/7 support tickets, and 30-day warranty return claims.

### ⚙️ Admin Operations & Sourcing OS
- **Executive Analytics**: Gross revenue in USDT, settled order counter, active air shipments, and net sourcing margin (+44.8%).
- **Critical Sourcing Queue (PRD §4.2 & §6.3)**: Maps paid orders to secret supplier acquisition codes (`SUP-GZ-4419`) and direct factory 1688 links with one-click PO dispatch.
- **Catalogue & Dual Video Manager**: Tabbed product creation & edit suite, 2 dedicated video slots, secret cost margins, promotional flags, and bulk CSV import/export.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens + Lucide Icons + Google Fonts (Montserrat)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent Cart & Wishlist stores)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`, RLS policies)
- **Payments**: Binance Pay API (HMAC-SHA512 Webhook Signing, USDT Settlement)
- **QR Generation**: Dynamic API QR Server for instant Binance Mobile App scan-to-pay

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/riff1431/lennoxchinamall.git
cd lennoxchinamall
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (refer to `.env.local.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

BINANCE_MERCHANT_ID=your-merchant-id
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lennox ChinaMall
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🎨 Brand Identity

- **Navy**: `#00143D` (Primary dark background, top headers, badges)
- **Red**: `#FF1028` (Action buttons, deal badges, flash deal timers, search buttons)
- **White**: `#FFFFFF` (Surface contrast)
- **USDT Emerald**: `#10B981` (Binance Pay badges, verified checkmarks)
- **Typography**: `Montserrat` (Google Fonts, weights 300 to 900)

---

## 📄 License
MIT © Lennox ChinaMall
