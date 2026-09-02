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

export interface LifestyleBannerSlide {
  id: string;
  image: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  button_text: string;
  link: string;
  is_active?: boolean;
}

export const DEFAULT_LIFESTYLE_SLIDES: LifestyleBannerSlide[] = [
  {
    id: "lifestyle-slide-1",
    image: "/banners/banner-your-world-lifestyle.jpg",
    title: "Your World.",
    title_highlight: "One Place.",
    subtitle: "Everything for every lifestyle.",
    button_text: "Shop Now",
    link: "/categories",
    is_active: true,
  },
  {
    id: "lifestyle-slide-2",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400&auto=format&fit=crop&q=80",
    title: "Next-Gen Hardware.",
    title_highlight: "Factory Direct.",
    subtitle: "High-performance tech & gear with 0% middleman markup.",
    button_text: "Explore Tech",
    link: "/categories",
    is_active: true,
  },
  {
    id: "lifestyle-slide-3",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80",
    title: "Global Trends.",
    title_highlight: "Wholesale Rates.",
    subtitle: "Curated apparel, home gear and accessories with door-to-door air express.",
    button_text: "View Collection",
    link: "/categories",
    is_active: true,
  },
];

export interface HeroDealOfTheDay {
  id: string;
  title: string;
  title_es?: string;
  slug: string;
  image: string;
  price: number;
  compare_price: number;
  discount_badge: string;
  rating: number;
  reviews_count: number;
  units_left: number;
  claimed_percent: number;
  button_text?: string;
  button_text_es?: string;
}

export interface HeroMiddleBanner {
  badge: string;
  badge_es?: string;
  badge_sub?: string;
  badge_sub_es?: string;
  title: string;
  title_es?: string;
  image: string;
  button_text: string;
  button_text_es?: string;
  link: string;
}

export interface HeroFourDealItem {
  id: string;
  title: string;
  titleEs?: string;
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  discountBadge?: string;
  rating?: number;
  reviews?: number;
  discountNote?: string;
  installments?: string;
  freeShipping?: string;
}

export interface HeroVideoReelItem {
  id: string;
  title: string;
  title_es?: string;
  subtitle?: string;
  subtitle_es?: string;
  tag: string;
  video_url: string;
  poster: string;
  product_link?: string;
  product_price?: number;
  hub?: string;
}

export interface HeroLennoxConfig {
  deal_of_the_day?: HeroDealOfTheDay;
  middle_banner?: HeroMiddleBanner;
  four_deals?: HeroFourDealItem[];
  video_reels?: HeroVideoReelItem[];
}

export const DEFAULT_HERO_LENNOX_CONFIG: HeroLennoxConfig = {
  deal_of_the_day: {
    id: "hero-deal-main",
    title: "Acoustic Audio by Goldwood 120W",
    title_es: "Acoustic Audio by Goldwood 120W",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    price: 100.0,
    compare_price: 180.0,
    discount_badge: "-45% OFF",
    rating: 4.9,
    reviews_count: 380,
    units_left: 8,
    claimed_percent: 82,
    button_text: "GRAB THIS DEAL →",
    button_text_es: "APROVECHAR OFERTA →",
  },
  middle_banner: {
    badge: "DIRECT CHINA FACTORY",
    badge_es: "FÁBRICA DIRECTA CHINA",
    badge_sub: "0% Middleman",
    badge_sub_es: "0% Intermediarios",
    title: "Direct Factory Gate Hardware & Electronics",
    title_es: "Fábrica Directa en Hardware y Electrónica",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    button_text: "Explore →",
    button_text_es: "Explorar →",
    link: "/categories/consumer-electronics",
  },
  four_deals: [
    {
      id: "hero-deal-1",
      title: "CMF Buds Pro 2 Wireless Earbuds",
      titleEs: "Auriculares Inalámbricos CMF Buds Pro 2",
      slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
      discountBadge: "-$10.00",
      comparePrice: 373.0,
      price: 363.0,
      rating: 4.9,
      reviews: 142,
      discountNote: "$10.00 Discount off",
      installments: "12x $30.00 Interest free",
      freeShipping: "Free shipping ⚡ FULL",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "hero-deal-2",
      title: "iPhone 17 Pro Max Titanium Sourcing",
      titleEs: "iPhone 17 Pro Max Titanio de Fábrica",
      slug: "eachine-ex5-4k-gps-fpv-drone",
      discountBadge: "-$10.00",
      comparePrice: 950.0,
      price: 940.0,
      rating: 5.0,
      reviews: 89,
      discountNote: "$10.00 Discount off",
      installments: "12x $78.00 Interest free",
      freeShipping: "Free shipping ⚡ FULL",
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "hero-deal-3",
      title: "Elegant Floral Embroidered Handbag",
      titleEs: "Bolso Elegante con Bordado Floral",
      slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
      discountBadge: "-$10.00",
      comparePrice: 100.0,
      price: 90.0,
      rating: 4.8,
      reviews: 210,
      discountNote: "$10.00 Discount off",
      installments: "12x $8.00 Interest free",
      freeShipping: "Free shipping ⚡ FULL",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "hero-deal-4",
      title: "Copper Alloy Inlaid Zircon Round Ring",
      titleEs: "Anillo Redondo con Zircón Incrustado",
      slug: "konnwei-kw850-obd2-car-diagnostic-scanner",
      discountBadge: "-50%",
      comparePrice: 18.0,
      price: 9.0,
      rating: 4.9,
      reviews: 56,
      discountNote: "Direct Factory Price",
      installments: "12x $1.00 Interest free",
      freeShipping: "Free shipping ⚡ FULL",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80",
    },
  ],
  video_reels: [
    {
      id: "reel-1",
      title: "Canton Fair Sourcing Booth",
      title_es: "Pabellón en Vivo de la Feria de Cantón",
      subtitle: "Guangzhou Complex • Verified Hardware & Robotics Suppliers",
      subtitle_es: "Complejo Cantón • Proveedores Verificados de Hardware y Robótica",
      tag: "LIVE QC",
      video_url: "/videos/hero/hero_ad_1.mp4",
      poster: "/videos/hero/hero_ad_1_thumb.jpg",
      product_link: "/products/eachine-ex5-4k-gps-fpv-drone",
      product_price: 189.0,
      hub: "Guangzhou Canton Hub",
    },
    {
      id: "reel-2",
      title: "Shenzhen Inspection Host",
      title_es: "Inspector en Vivo Laboratorio Shenzhen",
      subtitle: "Direct Bench Quality Control • Circuitry & Load Verification",
      subtitle_es: "Control de Calidad en Banco de Pruebas • Verificación de Carga y Circuitos",
      tag: "QC PASSED",
      video_url: "/videos/hero/hero_ad_2.mp4",
      poster: "/videos/hero/hero_ad_2_thumb.jpg",
      product_link: "/products/creality-ender-3-v3-se-3d-printer",
      product_price: 219.0,
      hub: "Shenzhen SZX Hub",
    },
  ],
};

export interface HomepageSectionConfig {
  slides?: HeroSlide[];
  lifestyle_slides?: LifestyleBannerSlide[];
  hero_lennox?: HeroLennoxConfig;
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
      hero_lennox: DEFAULT_HERO_LENNOX_CONFIG,
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
      lifestyle_slides: DEFAULT_LIFESTYLE_SLIDES,
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
