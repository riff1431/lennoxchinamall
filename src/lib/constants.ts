/**
 * Application-wide constants
 */

// ─── Site ───────────────────────────────────────────────────────────────────

export const SITE_NAME = "Lennox China Mall";
export const SITE_DESCRIPTION =
  "Your gateway to quality China-sourced products. Browse, pay with USDT, and get worldwide delivery.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Pagination ─────────────────────────────────────────────────────────────

export const PRODUCTS_PER_PAGE = 24;
export const ORDERS_PER_PAGE = 10;
export const ADMIN_TABLE_PAGE_SIZE = 25;
export const SEARCH_RESULTS_PER_PAGE = 20;

// ─── Cart ───────────────────────────────────────────────────────────────────

export const MAX_CART_ITEM_QUANTITY = 99;
export const CART_EXPIRY_DAYS = 30;

// ─── Payment ────────────────────────────────────────────────────────────────

export const PAYMENT_CURRENCY = "USDT";
export const PAYMENT_EXPIRY_MINUTES = 30;

// ─── Images ─────────────────────────────────────────────────────────────────

export const MAX_PRODUCT_IMAGES = 10;
export const MAX_PRODUCT_VIDEOS = 2;
export const MAX_REVIEW_IMAGES = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const MAX_IMAGE_SIZE_MB = 100;
export const MAX_VIDEO_SIZE_MB = 100;

// ─── Order Statuses (for display) ───────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  sourcing: "Sourcing",
  purchased: "Purchased from Supplier",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: "yellow",
  paid: "blue",
  sourcing: "orange",
  purchased: "indigo",
  processing: "purple",
  shipped: "cyan",
  delivered: "green",
  cancelled: "red",
  refunded: "gray",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  initiated: "Initiated",
  pending: "Pending",
  paid: "Paid",
  expired: "Expired",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
  review_required: "Review Required",
};

// ─── Shipping ───────────────────────────────────────────────────────────────

export const DEFAULT_SHIPPING_METHODS = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "15-30 business days",
    price: 0,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "7-15 business days",
    price: 12.99,
  },
  {
    id: "priority",
    name: "Priority Shipping",
    description: "5-10 business days",
    price: 24.99,
  },
];

// ─── Product Sort Options ───────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
];

// ─── Navigation ─────────────────────────────────────────────────────────────

export const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Categories", href: "/categories", icon: "Grid3X3" },
  { label: "Search", href: "/search", icon: "Search" },
  { label: "Wishlist", href: "/account/wishlist", icon: "Heart" },
  { label: "Account", href: "/account/profile", icon: "User" },
];

export const ACCOUNT_NAV_ITEMS = [
  { label: "Profile", href: "/account/profile", icon: "User" },
  { label: "Addresses", href: "/account/addresses", icon: "MapPin" },
  { label: "Orders", href: "/account/orders", icon: "Package" },
  { label: "Wishlist", href: "/account/wishlist", icon: "Heart" },
  { label: "Reviews", href: "/account/reviews", icon: "Star" },
  { label: "Support", href: "/account/support", icon: "MessageCircle" },
  { label: "Returns", href: "/account/returns", icon: "RotateCcw" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Suppliers", href: "/admin/suppliers", icon: "Truck" },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Promotions", href: "/admin/promotions", icon: "Tag" },
  { label: "Content", href: "/admin/content", icon: "FileText" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
