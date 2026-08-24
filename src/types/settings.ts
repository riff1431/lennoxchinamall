/**
 * Lennox ChinaMall — Enterprise Settings Type Definitions
 * Covers all 17 domains
 */

export interface StoreInfoSettings {
  store_name: string;
  legal_entity: string;
  tagline: string;
  support_email: string;
  business_phone: string;
  guangzhou_hub: string;
  shenzhen_hub: string;
  business_hours: string;
  timezone: string;
}

export interface BrandingSettings {
  primary_logo_url: string;
  dark_logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hero_banner_tag: string;
}

export interface CurrencySettings {
  base_currency: string;
  rates: Record<string, number>;
  symbol_position: "prefix" | "suffix";
  decimal_places: number;
}

export interface LocalizationSettings {
  default_locale: string;
  supported_locales: string[];
  date_format: string;
  time_format: "12h" | "24h";
  weight_unit: "kg" | "lbs";
  dimension_unit: "cm" | "in";
}

export interface TaxCustomsSettings {
  tax_mode: "zero_tax_export" | "inclusive" | "exclusive";
  default_hs_code: string;
  customs_declaration: string;
  customs_duty_handling: "ddu_dap" | "ddp";
}

export interface ShippingZonesSettings {
  air_express_lead_days: number;
  free_shipping_threshold: number;
  standard_air_cost: number;
  express_air_cost: number;
  default_carrier: string;
  allowed_zones: string[];
}

export interface OrderWorkflowSettings {
  unpaid_cancel_minutes: number;
  auto_complete_days: number;
  allow_guest_checkout: boolean;
  min_order_amount_usdt: number;
  max_order_amount_usdt: number;
  order_number_prefix: string;
}

export interface InvoiceSettings {
  invoice_prefix: string;
  tax_registration_no: string;
  company_title: string;
  terms_note: string;
  footer_declaration: string;
}

export interface EmailTemplatesSettings {
  order_confirmation_subject: string;
  payment_received_subject: string;
  shipping_dispatched_subject: string;
  sender_name: string;
  sender_email: string;
}

export interface NotificationSettings {
  notify_on_new_order: boolean;
  notify_on_low_stock: boolean;
  notify_on_payment_failed: boolean;
  low_stock_threshold: number;
  alert_recipient_email: string;
}

export interface BinancePaySettings {
  enabled: boolean;
  environment: "live" | "sandbox";
  zero_fee_promoted: boolean;
  merchant_id: string;
  api_key: string;
  api_secret: string;
  webhook_secret: string;
  accepted_tokens: string[];
}

export interface StorageSettings {
  products_bucket: string;
  banners_bucket: string;
  max_image_mb: number;
  max_video_mb: number;
  allowed_mime_types: string[];
}

export interface SeoSettings {
  meta_title_template: string;
  default_meta_title: string;
  default_meta_description: string;
  og_image_url: string;
  twitter_handle: string;
  google_site_verification: string;
  robots_txt: string;
}

export interface AnalyticsSettings {
  google_analytics_id: string;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  custom_head_scripts: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  heading: string;
  message: string;
  expected_duration_minutes: number;
  admin_bypass_key: string;
}

export interface SecuritySettings {
  max_login_attempts: number;
  lockout_duration_minutes: number;
  staff_session_timeout_hours: number;
  enforce_2fa_for_staff: boolean;
  ip_whitelist: string;
}

export interface BackupSettings {
  auto_backup_frequency: "hourly" | "daily" | "weekly";
  last_backup_date: string;
  backup_retention_days: number;
  cloud_sync_enabled: boolean;
}

export interface AllStoreSettings {
  store_info: StoreInfoSettings;
  branding: BrandingSettings;
  currencies: CurrencySettings;
  localization: LocalizationSettings;
  tax_customs: TaxCustomsSettings;
  shipping_zones: ShippingZonesSettings;
  order_workflow: OrderWorkflowSettings;
  invoice: InvoiceSettings;
  email_templates: EmailTemplatesSettings;
  notifications: NotificationSettings;
  binance_pay: BinancePaySettings;
  storage: StorageSettings;
  seo: SeoSettings;
  analytics: AnalyticsSettings;
  maintenance: MaintenanceSettings;
  security: SecuritySettings;
  backups: BackupSettings;
}
