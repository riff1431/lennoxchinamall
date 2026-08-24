/**
 * Lennox ChinaMall — Dynamic Homepage & Content CMS Type Definitions
 */

export type SectionType =
  | "hero_banner"
  | "category_grid"
  | "flash_deals"
  | "featured_products"
  | "best_sellers"
  | "new_arrivals"
  | "promo_blocks"
  | "trust_badges"
  | "dual_video_spotlight"
  | "custom_html";

export type SectionLayout = "carousel" | "grid" | "banner_strip" | "spotlight" | "cards";

export type SectionStatus = "published" | "draft" | "scheduled";

export type DeviceVisibility = "all" | "desktop_only" | "mobile_only";

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  price: number;
  original_price: number;
  tag: string;
  desktop_image: string;
  mobile_image?: string;
  link: string;
  hub: string;
}

export interface TrustBadgeItem {
  icon: string;
  title: string;
  desc: string;
}

export interface PromoBlockItem {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  link: string;
  badge: string;
  image_url: string;
  bg_gradient?: string;
}

export interface HomepageSectionConfig {
  slides?: HeroSlide[];
  badges?: TrustBadgeItem[];
  promo_blocks?: PromoBlockItem[];
  deal_ends_at?: string;
  discount_badge?: string;
  max_items?: number;
  show_product_counts?: boolean;
  max_categories?: number;
  show_video_badge?: boolean;
  show_supplier_origin?: boolean;
  custom_html_content?: string;
  [key: string]: any;
}

export interface HomepageSection {
  id: string;
  name: string;
  subtitle: string | null;
  type: SectionType;
  layout: SectionLayout;
  position: number;
  is_active: boolean;
  status: SectionStatus;
  visibility: DeviceVisibility;
  start_date: string | null;
  end_date: string | null;
  config: HomepageSectionConfig;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    name: "Direct Shenzhen Factory Hero Carousel",
    subtitle: "Zero middleman wholesale drops with verified Binance Pay USDT checkout",
    type: "hero_banner",
    layout: "carousel",
    position: 1,
    is_active: true,
    status: "published",
    visibility: "all",
    start_date: null,
    end_date: null,
    config: {
      slides: [
        {
          id: "slide-1",
          badge: "DIRECT SHENZHEN FACTORY LAUNCH",
          title: "4K Laser Gimbal Aerial Drones",
          subtitle: "Triple GPS auto-return, 5km transmission range & brushless motors. Sourced directly with zero middleman markups.",
          price: 189.0,
          original_price: 349.0,
          tag: "-46% OFF",
          desktop_image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
          mobile_image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
          link: "/products/eachine-ex5-4k-gps-fpv-drone",
          hub: "Shenzhen Drone Hub",
        },
        {
          id: "slide-2",
          badge: "DIRECT NINGBO INDUSTRIAL DROP",
          title: "CoreXY 600mm/s High-Speed 3D Printer",
          subtitle: "Direct-drive dual gear extruder, vibration compensation & auto-bed leveling. Factory calibrated precision.",
          price: 219.0,
          original_price: 399.0,
          tag: "-45% OFF",
          desktop_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
          mobile_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
          link: "/products/creality-ender-3-v3-se-3d-printer",
          hub: "Ningbo 3DP Lab",
        },
        {
          id: "slide-3",
          badge: "GUANGZHOU PRO AUDIO HUB",
          title: "120W Quad-Driver Outdoor Bluetooth Boombox",
          subtitle: "Dual passive radiators, 16000mAh battery pack with reverse USB charging & IPX5 water resistance.",
          price: 89.0,
          original_price: 169.0,
          tag: "-47% OFF",
          desktop_image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80",
          mobile_image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
          link: "/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
          hub: "Guangzhou Audio Center",
        },
      ],
    },
    created_at: "2026-08-24T12:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    name: "Flash Sourcing Drops",
    subtitle: "Direct factory overstock lots releasing every 6 hours with verified stock counts",
    type: "flash_deals",
    layout: "grid",
    position: 2,
    is_active: true,
    status: "published",
    visibility: "all",
    start_date: null,
    end_date: null,
    config: {
      deal_ends_at: "2026-08-25T18:00:00Z",
      discount_badge: "UP TO 60% OFF",
      max_items: 4,
    },
    created_at: "2026-08-24T12:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    name: "Factory Category Showcase",
    subtitle: "Explore wholesale product categories straight from industrial assembly lines",
    type: "category_grid",
    layout: "grid",
    position: 3,
    is_active: true,
    status: "published",
    visibility: "all",
    start_date: null,
    end_date: null,
    config: {
      show_product_counts: true,
      max_categories: 6,
    },
    created_at: "2026-08-24T12:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    name: "Featured Hardware & Dual-Video Teardowns",
    subtitle: "Inspected and benchmarked with live factory video teardowns before dispatch",
    type: "featured_products",
    layout: "grid",
    position: 4,
    is_active: true,
    status: "published",
    visibility: "all",
    start_date: null,
    end_date: null,
    config: {
      show_video_badge: true,
      show_supplier_origin: true,
      max_items: 4,
    },
    created_at: "2026-08-24T12:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000005",
    name: "Direct Factory Trust & Binance Escrow Guarantee",
    subtitle: "Why buyers and importers trust Lennox ChinaMall for cross-border hardware",
    type: "trust_badges",
    layout: "cards",
    position: 5,
    is_active: true,
    status: "published",
    visibility: "all",
    start_date: null,
    end_date: null,
    config: {
      badges: [
        {
          icon: "ShieldCheck",
          title: "0% Fee Binance Pay Escrow",
          desc: "Funds held securely until your express air cargo arrives with verified tracking.",
        },
        {
          icon: "Factory",
          title: "Direct China Sourcing",
          desc: "Zero middleman markups. Sourced straight from Shenzhen, Ningbo & Guangzhou.",
        },
        {
          icon: "Truck",
          title: "5-Day Air Express Freight",
          desc: "Direct cargo flights via YunExpress and SF International to your door.",
        },
        {
          icon: "Video",
          title: "Dual-Video QC Inspection",
          desc: "Every product verified with factory teardown & live performance video demos.",
        },
      ],
    },
    created_at: "2026-08-24T12:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
];
