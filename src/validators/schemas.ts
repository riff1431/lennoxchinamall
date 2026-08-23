/**
 * Shared Zod validation schemas for forms and API inputs.
 * Used on both client and server to ensure consistent validation.
 */
import { z } from "zod";

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    display_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// ─── Address ────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  full_name: z.string().min(2, "Full name is required").max(100),
  street_line_1: z.string().min(3, "Street address is required").max(200),
  street_line_2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/Province is required").max(100),
  country: z.string().min(2, "Country is required").max(100),
  postal_code: z.string().min(1, "Postal code is required").max(20),
  phone: z.string().max(20).optional().nullable(),
  is_default: z.boolean().default(false),
});

// ─── Profile ────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50),
  phone: z.string().max(20).optional().nullable(),
});

// ─── Checkout ───────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  shipping_address_id: z.string().uuid("Please select a shipping address"),
  shipping_method: z.string().min(1, "Please select a shipping method"),
  coupon_code: z.string().optional(),
  notes: z.string().max(500).optional(),
  terms_accepted: z.literal(true, { error: "You must accept the terms and conditions" }),
});

// ─── Review ─────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

// ─── Support Ticket ─────────────────────────────────────────────────────────

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  category: z.string().optional(),
  body: z.string().min(10, "Message must be at least 10 characters").max(5000),
  order_id: z.string().uuid().optional(),
});

// ─── Return Request ─────────────────────────────────────────────────────────

export const returnRequestSchema = z.object({
  order_id: z.string().uuid(),
  order_item_id: z.string().uuid().optional(),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().max(2000).optional(),
});

// ─── Admin: Product ─────────────────────────────────────────────────────────

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  sku: z.string().min(1, "SKU is required").max(50),
  short_description: z.string().max(500).optional().nullable(),
  description: z.string().max(50000).optional().nullable(),
  category_id: z.string().uuid("Please select a category"),
  brand_id: z.string().uuid().optional().nullable(),
  base_price: z.number().min(0, "Price must be positive"),
  compare_at_price: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  status: z.enum(["draft", "published", "archived", "scheduled"]),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_flash_deal: z.boolean().default(false),
  flash_deal_ends_at: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  weight: z.number().min(0).optional().nullable(),
  shipping_origin: z.string().optional().nullable(),
  supplier_code: z.string().optional().nullable(),
  seo_title: z.string().max(70).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
});

export const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).default(5),
  weight: z.number().min(0).optional().nullable(),
  attributes: z.record(z.string(), z.string()),
  supplier_code: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// ─── Admin: Supplier ────────────────────────────────────────────────────────

export const supplierSchema = z.object({
  code: z.string().min(1, "Supplier code is required").max(50),
  name: z.string().min(2, "Name is required").max(200),
  contact: z.string().max(500).optional().nullable(),
  platform: z.string().max(100).optional().nullable(),
  source_url: z.string().url().optional().nullable().or(z.literal("")),
  region: z.string().max(100).optional().nullable(),
  lead_time_days: z.number().int().min(0).optional().nullable(),
  reliability_notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// ─── Admin: Coupon ──────────────────────────────────────────────────────────

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(30)
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0.01, "Value must be positive"),
  min_spend: z.number().min(0).optional().nullable(),
  max_uses: z.number().int().min(1).optional().nullable(),
  per_user_limit: z.number().int().min(1).default(1),
  valid_from: z.string(),
  valid_until: z.string(),
  is_active: z.boolean().default(true),
});

// ─── Admin: Banner ──────────────────────────────────────────────────────────

export const bannerSchema = z.object({
  title: z.string().min(1).max(200),
  location: z.enum(["hero", "category", "announcement"]),
  image_desktop: z.string().url({ error: "Desktop image URL is required" }),
  image_mobile: z.string().url().optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal("")),
  position: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

// ─── Admin: Page ────────────────────────────────────────────────────────────

export const pageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  body: z.string(),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().max(70).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
});

// ─── Type inference helpers ─────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type PageInput = z.infer<typeof pageSchema>;
