import { AllStoreSettings } from "@/types/settings";

export const DEFAULT_STORE_SETTINGS: AllStoreSettings = {
  store_info: {
    store_name: "Lennox China Mall",
    legal_entity: "Lennox Global Trading Ltd.",
    tagline: "Direct China Factory Sourcing & Wholesale Hardware Portal",
    support_email: "support@lennoxchinamall.com",
    business_phone: "+86 755 8899 0011",
    guangzhou_hub: "Building 4, Baiyun International Logistics Park, Guangzhou, GD 510440",
    shenzhen_hub: "Floor 8, SkyRover Drone Industrial Park, Nanshan, Shenzhen, GD 518057",
    business_hours: "Mon-Fri: 09:00 - 18:00 (GMT+8)",
    timezone: "Asia/Shanghai",
  },
  branding: {
    primary_logo_url: "/logo-lennoxchinamall.png",
    dark_logo_url: "/logo-lennoxchinamall-white.png",
    favicon_url: "/favicon.ico",
    primary_color: "#FF1028",
    secondary_color: "#00143D",
    accent_color: "#10B981",
    hero_banner_tag: "DIRECT FACTORY SOURCING IN USDT",
  },
  currencies: {
    base_currency: "USDT",
    rates: {
      USDT: 1.0,
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.78,
      AUD: 1.52,
      CAD: 1.36,
      CNY: 7.24,
      AED: 3.67,
      SAR: 3.75,
    },
    symbol_position: "prefix",
    decimal_places: 2,
  },
  localization: {
    default_locale: "es",
    supported_locales: ["en", "es"],
    date_format: "MMM DD, YYYY",
    time_format: "24h",
    weight_unit: "kg",
    dimension_unit: "cm",
  },
  tax_customs: {
    tax_mode: "zero_tax_export",
    default_hs_code: "85176200",
    customs_declaration: "Direct China cross-border wholesale hardware export with duty prepaid options.",
    customs_duty_handling: "ddu_dap",
  },
  shipping_zones: {
    air_express_lead_days: 5,
    free_shipping_threshold: 75.0,
    standard_air_cost: 8.5,
    express_air_cost: 18.0,
    default_carrier: "YunExpress Air Freight",
    allowed_zones: [
      "North America",
      "European Union",
      "United Kingdom",
      "Australia & NZ",
      "Middle East",
      "Southeast Asia",
    ],
  },
  order_workflow: {
    unpaid_cancel_minutes: 120,
    auto_complete_days: 14,
    allow_guest_checkout: false,
    min_order_amount_usdt: 10.0,
    max_order_amount_usdt: 50000.0,
    order_number_prefix: "LCM",
  },
  invoice: {
    invoice_prefix: "LCM-INV-2026-",
    tax_registration_no: "CN-GZ-91440101MA59X89",
    company_title: "Lennox ChinaMall Direct Sourcing Operations",
    terms_note: "Payment settled exclusively in verified USDT via Binance Pay escrow.",
    footer_declaration: "Goods inspected at Shenzhen/Guangzhou testing facilities before air cargo departure.",
  },
  email_templates: {
    order_confirmation_subject: "Order Confirmed #{order_number} — Lennox ChinaMall",
    payment_received_subject: "Binance Pay USDT Payment Verified for #{order_number}",
    shipping_dispatched_subject: "Air Cargo Dispatched! Track #{tracking_number}",
    sender_name: "Lennox ChinaMall Fulfilment Desk",
    sender_email: "orders@lennoxchinamall.com",
  },
  notifications: {
    notify_on_new_order: true,
    notify_on_low_stock: true,
    notify_on_payment_failed: true,
    low_stock_threshold: 5,
    alert_recipient_email: "alerts@lennoxchinamall.com",
  },
  binance_pay: {
    enabled: true,
    environment: "live",
    zero_fee_promoted: true,
    merchant_id: "384910291",
    api_key: "live_bn_api_8849201948201",
    api_secret: "live_bn_sec_9948201928401928",
    webhook_secret: "live_wh_sec_7729104829104",
    accepted_tokens: ["USDT", "USDC", "BTC", "ETH", "BNB"],
  },
  storage: {
    products_bucket: "products",
    banners_bucket: "banners",
    max_image_mb: 100,
    max_video_mb: 100,
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
  },
  seo: {
    meta_title_template: "%s | Lennox ChinaMall Direct Sourcing",
    default_meta_title: "Lennox ChinaMall — Direct China Sourcing & Wholesale Hardware Portal",
    default_meta_description: "Buy 4K camera drones, CoreXY 3D printers, and professional audio at direct factory prices with Binance Pay USDT escrow.",
    og_image_url: "/logo-lennoxchinamall.png",
    twitter_handle: "@lennoxchinamall",
    google_site_verification: "gsc_token_verification_lennox_2026",
    robots_txt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /auth/\nSitemap: https://lennoxchinamall.com/sitemap.xml",
  },
  analytics: {
    google_analytics_id: "G-LENNOX2026",
    facebook_pixel_id: "",
    tiktok_pixel_id: "",
    custom_head_scripts: "",
  },
  maintenance: {
    enabled: false,
    heading: "Lennox ChinaMall Scheduled System Upgrade",
    message: "We are synchronizing Shenzhen factory inventory lots. Checkout resumes shortly.",
    expected_duration_minutes: 30,
    admin_bypass_key: "lennox_admin_bypass_2026",
  },
  security: {
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    staff_session_timeout_hours: 8,
    enforce_2fa_for_staff: false,
    ip_whitelist: "",
  },
  backups: {
    auto_backup_frequency: "daily",
    last_backup_date: "2026-08-24T12:00:00Z",
    backup_retention_days: 30,
    cloud_sync_enabled: true,
  },
};

/**
 * Masks private tokens and secrets for safe display.
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return "";
  if (secret.length <= 8) return "••••••••";
  return `••••••••••••${secret.slice(-4)}`;
}
