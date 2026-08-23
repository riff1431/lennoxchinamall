# Lennox ChinaMall — UX Wireframes & Flow Specifications

## 1. Information Architecture & User Flow Maps

```mermaid
graph TD
    A[Storefront Visitor / Customer] --> B[Homepage]
    B --> C[Category / Search Listing]
    B --> D[Flash Deals & Collections]
    C --> E[Product Detail Page - PDP]
    D --> E
    E --> F[Add to Cart / Buy Now]
    F --> G[Cart Drawer / Cart Page]
    G --> H[Multi-step Checkout]
    H --> I[Binance Pay / USDT QR Payment Modal]
    I --> J[Order Confirmation & Tracking Timeline]
    J --> K[Customer Account Portal]
    K --> L[Orders / Returns / Reviews / Tickets]

    M[Admin / Manager] --> N[Admin Login]
    N --> O[Admin Dashboard & KPIs]
    O --> P[Sourcing Queue & Private Supplier Codes]
    O --> Q[Product & Dual-Video Manager]
    O --> R[Order Fulfilment & Tracking]
    O --> S[Binance Payment Reconciliation]
    O --> T[Promotions, Banners & Store Settings]
```

---

## 2. Page Wireframe Schematics

### 2.1 Storefront Header & Global Navigation
```
+-----------------------------------------------------------------------------------------------+
| Top Bar: 🚀 Free Worldwide Shipping on orders over $50 USDT | 24/7 Sourcing Support | [USDT v] |
+-----------------------------------------------------------------------------------------------+
| [ LENNOX CHINAMALL ]  | [🔍 Search 100,000+ China-direct products...        [Search]] | [❤️ 3] [🛒 2] [👤 Account] |
+-----------------------------------------------------------------------------------------------+
| [☰ All Categories v] | Flash Deals | New Arrivals | Best Sellers | Tech & Gadgets | Home & Living | Fast Sourcing |
+-----------------------------------------------------------------------------------------------+
```

### 2.2 Homepage Structure
```
+-----------------------------------------------------------------------------------------------+
| [ Category Sidebar ] | [ 🎠 Hero Promotional Banner Carousel (USDT Drops & Hot Deals) ]        |
+-----------------------------------------------------------------------------------------------+
| [ ⚡ FLASH DEALS: Ends in 04h:23m:11s ] -------------------------------------- [ View All > ]  |
| [ Product Card 1 ] [ Product Card 2 ] [ Product Card 3 ] [ Product Card 4 ] [ Product Card 5 ]|
+-----------------------------------------------------------------------------------------------+
| [ 🏷️ Category Shortcuts: 📱 Electronics | 🎧 Audio | 🏠 Home | ⌚ Smartwatches | 🚗 Auto ]    |
+-----------------------------------------------------------------------------------------------+
| [ 🏆 Trending & Best Sellers ] [ 🆕 New Direct-from-Factory Arrivals ]                        |
+-----------------------------------------------------------------------------------------------+
| [ 🛡️ Trust Strip: 100% USDT Verified | Factory Direct Pricing | Inspected Quality | Global Track ]|
+-----------------------------------------------------------------------------------------------+
```

### 2.3 Product Detail Page (PDP) with Dual Video Module
```
+----------------------------------------------------------------------------------------------------------+
| Breadcrumbs: Home > Electronics > Smart Wearables > Ultra Smartwatch 8 Max                              |
+----------------------------------------------------+-----------------------------+-----------------------+
| [ Media Gallery ]                                  | [ Product Information ]     | [ 🎥 Dual Video Slot ]|
| +------------------------------------------------+ | Title: Ultra Smartwatch Pro | +-------------------+ |
| |                                                | | Rating: ⭐⭐⭐⭐☆ (4.8/5)   | | [ Video 1: Demo ] | |
| |              Main Product Image                | | Sold: 1,420 units         | | Unboxing & Specs  | |
| |              (Zoomable Preview)                | | Price: $34.50 USDT        | +-------------------+ |
| |                                                | | Was: ~~$69.00~~ (-50%)    | +-------------------+ |
| +------------------------------------------------+ | Stock: In Stock (48 left)   | | [ Video 2: Test ] | |
| [Thumb1] [Thumb2] [Thumb3] [Thumb4]              | Color: [🔘 Black] [⚪ Silver] | | Waterproof Test   | |
|                                                    | Quantity: [-] [ 1 ] [+]     | +-------------------+ |
|                                                    | [ 🛒 Add to Cart ]          |                       |
|                                                    | [ ⚡ Buy with USDT Now ]    |                       |
+----------------------------------------------------+-----------------------------+-----------------------+
| Tabs: [ 📋 Specifications ] [ 📦 Package Contents ] [ ⭐ Reviews (128) ] [ 🚚 Shipping & Warranty ]     |
+----------------------------------------------------------------------------------------------------------+
```

### 2.4 Binance Pay / USDT Checkout & Sourcing Wireframe
```
+-------------------------------------------------------+---------------------------------------+
| 1. Shipping Details (Address, Contact, Country)       | Order Summary:                        |
| 2. Shipping Carrier & Speed (Standard / Express)      | Subtotal: $69.00 USDT                 |
| 3. Payment Method: Binance Pay (USDT)                 | Shipping: FREE                        |
|    +------------------------------------------------+ | Discount: -$5.00 USDT                 |
|    |  [ QR Code ] Scan with Binance App             | | Total Due: $64.00 USDT                |
|    |  Pay to: Lennox ChinaMall Merchant             | +---------------------------------------+
|    |  Amount: 64.000000 USDT                        | [ 🔒 Confirm & Authorize Payment ]    |
|    |  Expires in: 29:45                             |                                       |
|    +------------------------------------------------+ |                                       |
+-------------------------------------------------------+---------------------------------------+
```

---

## 3. Admin & Private Sourcing Dashboard

```
+----------------------------------------------------------------------------------------------------------+
| [ LENNOX ADMIN ]  | 📊 Dashboard | 📦 Products | 🛒 Orders (12) | 🚚 Sourcing Queue (5) | 💳 Payments | ⚙️ |
+----------------------------------------------------------------------------------------------------------+
| [ Sourcing Backlog / Paid Orders Ready for Sourcing ]                                                    |
| Order #LCM-2026-0812 | Item: Ultra Watch (Black) | Cust: John D. (US) | Price: $34.50 USDT                |
| 🔒 Private Supplier Code: SUP-SZ-8839 (Shenzhen Factory 3)                                              |
| Direct Sourcing Link: [🔗 Open 1688 / AliExpress Supplier Page] | Supplier Cost: ¥85.00 (~$11.80 USDT)   |
| Projected Margin: +$22.70 USDT (65.8%)                                                                   |
| [ Actions: Record Supplier PO # ] [ Mark Sourced ] [ Update Tracking ]                                   |
+----------------------------------------------------------------------------------------------------------+
```
