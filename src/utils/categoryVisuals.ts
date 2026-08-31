/**
 * Lennox ChinaMall — Category Visual Assets & Presets
 * Provides smart fallback images, cover banners, icons, and color palettes
 * for all catalog categories.
 */

export interface CategoryPreset {
  keywords: string[];
  icon: string;
  bgColor: string;
  thumbnailUrl: string;
  imageUrl: string;
  defaultSubcategories: string[];
}

export const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  drones: {
    keywords: ["drone", "fpv", "uav", "quadcopter", "rc", "flight", "aerial"],
    icon: "Camera",
    bgColor: "#F3E8FF",
    thumbnailUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["4K GPS Drones", "FPV Racers", "Goggles & Transmitters", "LiPo Batteries & Props"],
  },
  printers: {
    keywords: ["3d", "printer", "cnc", "laser", "engrav", "filament", "resin", "maker"],
    icon: "Printer",
    bgColor: "#FEF3C7",
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["FDM 3D Printers", "Resin SLA Printers", "Laser Engravers & Cutters", "PLA / PETG Filaments"],
  },
  audio: {
    keywords: ["audio", "sound", "boombox", "speaker", "headphone", "earphone", "hifi", "music", "mic"],
    icon: "Headphones",
    bgColor: "#EEF2FF",
    thumbnailUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Bluetooth Boomboxes", "ANC Studio Headphones", "Wireless Earbuds", "Microphones & Mixers"],
  },
  electronics: {
    keywords: ["electronic", "gadget", "smart", "tech", "phone", "tablet", "watch", "camera"],
    icon: "Smartphone",
    bgColor: "#E0F2FE",
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeede?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Smartwatches & Bands", "Action Cameras", "Power Banks & GaN Chargers", "Cables & Adapters"],
  },
  mensFashion: {
    keywords: ["men", "mens", "male", "guy", "suit", "sneaker", "streetwear"],
    icon: "Shirt",
    bgColor: "#EBF4FB",
    thumbnailUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Shirts & Polos", "Pants & Cargo", "Jackets & Hoodies", "Shoes & Sneakers"],
  },
  womensFashion: {
    keywords: ["women", "womens", "female", "lady", "dress", "bag", "handbag", "jewelry", "heels"],
    icon: "ShoppingBag",
    bgColor: "#FDF0EB",
    thumbnailUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Evening Dresses", "Designer Handbags", "Activewear & Sets", "Fine Jewelry & Rings"],
  },
  kidsFashion: {
    keywords: ["kid", "kids", "children", "child", "boy", "girl", "school", "backpack"],
    icon: "Baby",
    bgColor: "#FBEBF4",
    thumbnailUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503944570678-75c1a7d6e42b?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Boys' Outfits", "Girls' Dresses", "Kids Footwear", "School Bags"],
  },
  beauty: {
    keywords: ["beauty", "skin", "skincare", "cosmetic", "makeup", "hair", "perfume", "serum"],
    icon: "Sparkles",
    bgColor: "#EBFBF2",
    thumbnailUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Face Serums", "Lipsticks & Makeup", "Hair Care Tools", "Facial Massagers"],
  },
  homeKitchen: {
    keywords: ["home", "kitchen", "cook", "appliance", "blender", "fryer", "coffee", "furniture"],
    icon: "Utensils",
    bgColor: "#F4FBEB",
    thumbnailUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Air Fryers & Blenders", "Espresso Machines", "Cookware & Knives", "Smart Home Cleaners"],
  },
  sports: {
    keywords: ["sport", "sports", "fitness", "gym", "workout", "camp", "cycling", "bike", "hike"],
    icon: "Dumbbell",
    bgColor: "#EBF4FB",
    thumbnailUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["Gym Weights & Racks", "Cycling Accessories", "Camping & Tents", "Sports Balls"],
  },
  auto: {
    keywords: ["auto", "car", "motor", "scooter", "obd", "dashcam", "vehicle", "tool", "garage"],
    icon: "Car",
    bgColor: "#E0F2FE",
    thumbnailUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["OBD2 Scanners", "Dual 4K Dashcams", "Jump Starters & Inflators", "E-Scooter Parts"],
  },
};

/**
 * Find matching visual presets for a category based on its name or slug
 */
export function getCategoryVisualPreset(nameOrSlug: string): CategoryPreset {
  const normalized = (nameOrSlug || "").toLowerCase();

  for (const key of Object.keys(CATEGORY_PRESETS)) {
    const preset = CATEGORY_PRESETS[key];
    if (preset.keywords.some((kw) => normalized.includes(kw))) {
      return preset;
    }
  }

  // Generic Tech/Commerce Fallback
  return {
    keywords: [],
    icon: "FolderTree",
    bgColor: "#F1F5F9",
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    defaultSubcategories: ["All Products", "Wholesale Lots", "New Arrivals"],
  };
}

/**
 * Return curated featured banner assets list for admin 1-click picker
 */
export const CURATED_CATEGORY_GALLERY = [
  {
    title: "4K Drones & FPV Racing",
    category: "RC Drones & Toys",
    thumbnail: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80",
    icon: "Camera",
    bgColor: "#F3E8FF",
  },
  {
    title: "3D Printers & Laser CNC",
    category: "Tools & Industrial",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    icon: "Printer",
    bgColor: "#FEF3C7",
  },
  {
    title: "Pro Audio & Boomboxes",
    category: "Consumer Electronics",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    icon: "Headphones",
    bgColor: "#EEF2FF",
  },
  {
    title: "Men's Luxury & Streetwear",
    category: "Men's Fashion",
    thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&auto=format&fit=crop&q=80",
    icon: "Shirt",
    bgColor: "#EBF4FB",
  },
  {
    title: "Women's Boutique & Bags",
    category: "Women's Fashion",
    thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80",
    icon: "ShoppingBag",
    bgColor: "#FDF0EB",
  },
  {
    title: "Health, Glow & Skincare",
    category: "Health & Beauty",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    icon: "Sparkles",
    bgColor: "#EBFBF2",
  },
  {
    title: "Modern Smart Appliances",
    category: "Home & Kitchen",
    thumbnail: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
    icon: "Utensils",
    bgColor: "#F4FBEB",
  },
  {
    title: "Performance Sports & Outdoor",
    category: "Sports & Outdoors",
    thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    icon: "Dumbbell",
    bgColor: "#EBF4FB",
  },
  {
    title: "Automotive Tech & Scanners",
    category: "Automotive & E-Mobility",
    thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80",
    icon: "Car",
    bgColor: "#E0F2FE",
  },
  {
    title: "Pet Automation & Feeders",
    category: "Pet Supplies",
    thumbnail: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80",
    icon: "Footprints",
    bgColor: "#EBF9FB",
  },
];
