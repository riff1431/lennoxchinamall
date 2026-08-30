import { Category, Brand, Product, Order, Supplier } from "@/types/database";

export const MOCK_CATEGORIES: (Category & { iconName: string; subcategories?: string[] })[] = [
  {
    id: "cat-mf",
    name: "Men's Fashion",
    slug: "mens-fashion",
    parent_id: null,
    description: "Factory-direct men's apparel, footwear, streetwear, and accessories",
    image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&auto=format&fit=crop&q=80",
    icon: "Shirt",
    iconName: "Shirt",
    bg_color: "#EBF4FB",
    position: 1,
    is_active: true,
    seo_title: "Men's Fashion & Apparel - Lennox ChinaMall",
    seo_description: "Direct-from-factory men's clothing and fashion goods.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Shirts & Tops", "Pants & Denim", "Jackets & Hoodies", "Shoes & Sneakers"],
    product_count: 320
  },
  {
    id: "cat-wf",
    name: "Women's Fashion",
    slug: "womens-fashion",
    parent_id: null,
    description: "Trendy women's clothing, dresses, designer bags, and jewelry",
    image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&auto=format&fit=crop&q=80",
    icon: "ShoppingBag",
    iconName: "ShoppingBag",
    bg_color: "#FDF0EB",
    position: 2,
    is_active: true,
    seo_title: "Women's Fashion & Dresses - Lennox ChinaMall",
    seo_description: "Boutique dresses and accessories straight from verified manufacturers.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Dresses", "Handbags & Totes", "Activewear", "Jewelry & Rings"],
    product_count: 480
  },
  {
    id: "cat-kf",
    name: "Kid's Fashion",
    slug: "kids-fashion",
    parent_id: null,
    description: "Comfortable, stylish children's clothing and footwear",
    image_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80",
    icon: "Baby",
    iconName: "Baby",
    bg_color: "#FBEBF4",
    position: 3,
    is_active: true,
    seo_title: "Kid's Fashion & Wear - Lennox ChinaMall",
    seo_description: "Direct children's clothing and sets at wholesale prices.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Boys' Wear", "Girls' Wear", "Kids Footwear", "Backpacks"],
    product_count: 210
  },
  {
    id: "cat-hb",
    name: "Health & Beauty",
    slug: "health-beauty",
    parent_id: null,
    description: "Skincare, cosmetics, personal care, and massage wellness",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80",
    icon: "Sparkles",
    iconName: "Sparkles",
    bg_color: "#EBFBF2",
    position: 4,
    is_active: true,
    seo_title: "Health & Beauty - Lennox ChinaMall",
    seo_description: "Top grade skincare and beauty products.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Skincare", "Makeup & Lips", "Hair Care", "Massage Devices"],
    product_count: 290
  },
  {
    id: "cat-ps",
    name: "Pet Supplies",
    slug: "pet-supplies",
    parent_id: null,
    description: "Pet toys, feeders, grooming supplies, and comfy pet beds",
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80",
    icon: "Footprints",
    iconName: "Footprints",
    bg_color: "#EBF9FB",
    position: 5,
    is_active: true,
    seo_title: "Pet Supplies & Accessories - Lennox ChinaMall",
    seo_description: "Wholesale pet care accessories and automatic feeders.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Smart Feeders", "Pet Beds", "Grooming Tools", "Collars & Leashes"],
    product_count: 165
  },
  {
    id: "cat-hk",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    parent_id: null,
    description: "Kitchen appliances, blenders, air fryers, and modern home essentials",
    image_url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&auto=format&fit=crop&q=80",
    icon: "Utensils",
    iconName: "Utensils",
    bg_color: "#F4FBEB",
    position: 6,
    is_active: true,
    seo_title: "Home & Kitchen - Lennox ChinaMall",
    seo_description: "High performance kitchen appliances and home living gadgets.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Blenders & Juicers", "Air Fryers", "Coffee Makers", "Cookware Sets"],
    product_count: 340
  },
  {
    id: "cat-bt",
    name: "Baby & Toddler",
    slug: "baby-toddler",
    parent_id: null,
    description: "Infant care, strollers, baby clothes, and safety toys",
    image_url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&auto=format&fit=crop&q=80",
    icon: "Baby",
    iconName: "Baby",
    bg_color: "#FBEBEB",
    position: 7,
    is_active: true,
    seo_title: "Baby & Toddler Essentials - Lennox ChinaMall",
    seo_description: "Safe and verified baby care items.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Strollers", "Feeding Bottles", "Baby Nursery", "Infant Clothes"],
    product_count: 140
  },
  {
    id: "cat-so",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    parent_id: null,
    description: "Fitness gear, balls, sports equipment, and camping hardware",
    image_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300&auto=format&fit=crop&q=80",
    icon: "Dumbbell",
    iconName: "Dumbbell",
    bg_color: "#EBF4FB",
    position: 8,
    is_active: true,
    seo_title: "Sports & Outdoors - Lennox ChinaMall",
    seo_description: "Direct fitness hardware, sports accessories, and outdoor gear.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Fitness Equipment", "Soccer & Basketball", "Camping Tents", "Cycling Gear"],
    product_count: 220
  },
  {
    id: "cat-1",
    name: "Consumer Electronics",
    slug: "consumer-electronics",
    parent_id: null,
    description: "Factory-direct smart gadgets, audio, cameras, and accessories",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    icon: "Smartphone",
    iconName: "Smartphone",
    bg_color: "#EEF2FF",
    position: 9,
    is_active: true,
    seo_title: "Consumer Electronics - Lennox ChinaMall",
    seo_description: "Direct-from-factory electronics, audio gears, and smart gadgets in USDT.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Audio & Headphones", "Smartwatches", "Action Cameras", "Power Banks & Chargers"],
    product_count: 142
  },
  {
    id: "cat-2",
    name: "RC Drones & Toys",
    slug: "rc-drones-toys",
    parent_id: null,
    description: "High precision 4K GPS drones, FPV racers, and RC hobby models",
    image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80",
    icon: "Plane",
    iconName: "Plane",
    bg_color: "#F3E8FF",
    position: 10,
    is_active: true,
    seo_title: "RC Drones & Hobbies - Lennox ChinaMall",
    seo_description: "Top grade 4K camera drones and remote-controlled vehicles.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["4K Camera Drones", "FPV Goggles & Radios", "RC Cars & Buggies", "Spare Parts & Batteries"],
    product_count: 98
  },
  {
    id: "cat-3",
    name: "Tools & DIY Hardware",
    slug: "tools-diy-hardware",
    parent_id: null,
    description: "Laser engravers, 3D printers, soldering stations, and precision tools",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80",
    icon: "Wrench",
    iconName: "Wrench",
    bg_color: "#FEF3C7",
    position: 11,
    is_active: true,
    seo_title: "Tools, 3D Printers & Industrial - Lennox ChinaMall",
    seo_description: "Professional maker tools, CNC machines, and soldering kits.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["3D Printers & Filaments", "Laser Engravers", "Soldering & Rework", "Multimeters & Oscilloscopes"],
    product_count: 85
  },
  {
    id: "cat-5",
    name: "Automotive & E-Mobility",
    slug: "automotive-e-mobility",
    parent_id: null,
    description: "OBD2 diagnostic scanners, dash cams, and electric scooter accessories",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&auto=format&fit=crop&q=80",
    icon: "Car",
    iconName: "Car",
    bg_color: "#E0F2FE",
    position: 12,
    is_active: true,
    seo_title: "Car Electronics & Diagnostic Tools - Lennox ChinaMall",
    seo_description: "Direct automotive tools, jump starters, and dashcams.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["OBD2 Scanners", "Dual Dash Cams", "Jump Starters", "Tire Inflators"],
    product_count: 64
  }
];

export const MOCK_BRANDS: Brand[] = [
  { id: "brand-1", name: "Eachine Labs", slug: "eachine-labs", logo_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80", description: "FPV & Aerial RC Tech", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-2", name: "BlitzWolf", slug: "blitzwolf", logo_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80", description: "Audio & Power Accessories", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-3", name: "Creality 3D", slug: "creality-3d", logo_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80", description: "Desktop 3D Printing & Laser", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-4", name: "Astrolux EDC", slug: "astrolux-edc", logo_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&auto=format&fit=crop&q=80", description: "High Performance Flashlights", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-5", name: "Topshak Tools", slug: "topshak-tools", logo_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&auto=format&fit=crop&q=80", description: "Power Tools & Solder Gear", is_active: true, created_at: new Date().toISOString() }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Eachine EX5 4K GPS 5G WiFi FPV Brushless RC Drone with 30min Flight Time",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    sku: "EAC-EX5-4K-BLK",
    short_description: "Ultra-compact foldable 4K UHD camera drone with GPS return-to-home, optical flow positioning, and 1000m range.",
    description: `### Flagship Sourced Aerial Drone for Enthusiasts
The Eachine EX5 combines commercial-grade GPS dual satellite positioning with a 4K UHD motorized tilt camera. Powered by brushless motors for wind resistance up to Level 5.

#### Key Features:
- **4K UHD Camera**: Electronic Image Stabilization with 90° adjustable angle
- **Intelligent GPS Return**: Automatic return on low battery or signal loss
- **Long Battery Endurance**: High capacity 7.4V 2200mAh modular battery delivers up to 30 mins
- **Brushless Power**: Low noise, high longevity, resistant against strong gusts
- **Waypoints & Orbit Mode**: Program flights directly on mobile app with live 5G FPV stream.`,
    category_id: "cat-2",
    brand_id: "brand-1",
    base_price: 89.99,
    compare_at_price: 159.99,
    cost: 48.50, // Private: Admin only
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hrs left
    tags: ["drone", "4k", "gps", "fpv", "brushless"],
    weight: 0.23,
    dimensions: { length: 24, width: 19, height: 7 },
    shipping_origin: "Guangdong, China",
    hs_code: "88062200",
    supplier_code: "SUP-GZ-4419", // Private: Admin only
    seo_title: "Eachine EX5 4K GPS FPV Drone - Direct from China in USDT",
    seo_description: "Buy Eachine EX5 4K GPS drone with 30min battery and 5G FPV live stream at direct factory price with USDT.",
    avg_rating: 4.85,
    review_count: 248,
    sold_count: 1890,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-1", product_id: "prod-1", url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80", alt: "Eachine EX5 Drone in Flight", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-2", product_id: "prod-1", url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80", alt: "Drone Remote Controller & Folded Body", type: "image", position: 2, created_at: new Date().toISOString() },
      { id: "m-3", product_id: "prod-1", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", alt: "Electronics and Brushless Motor Close-up", type: "image", position: 3, created_at: new Date().toISOString() },
      { id: "m-4", product_id: "prod-1", url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80", alt: "Aerial 4K landscape capture view", type: "image", position: 4, created_at: new Date().toISOString() }
    ],
    videos: [
      {
        id: "v-1",
        product_id: "prod-1",
        url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
        type: "uploaded",
        position: 1,
        title: "Video 1: Drone Flight Test & Range Demo",
        created_at: new Date().toISOString()
      },
      {
        id: "v-2",
        product_id: "prod-1",
        url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
        type: "uploaded",
        position: 2,
        title: "Video 2: Unboxing & Dual Battery Setup",
        created_at: new Date().toISOString()
      }
    ],
    variants: [
      {
        id: "var-1-1",
        product_id: "prod-1",
        sku: "EAC-EX5-1BAT",
        price: 89.99,
        compare_at_price: 159.99,
        cost: 48.50,
        stock: 35,
        low_stock_threshold: 5,
        weight: 0.45,
        attributes: { Battery: "1 Battery", StorageBag: "Included" },
        image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-GZ-4419-1B",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "var-1-2",
        product_id: "prod-1",
        sku: "EAC-EX5-2BAT",
        price: 104.99,
        compare_at_price: 189.99,
        cost: 57.00,
        stock: 22,
        low_stock_threshold: 5,
        weight: 0.55,
        attributes: { Battery: "2 Batteries (60min)", StorageBag: "Included" },
        image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-GZ-4419-2B",
        is_active: true,
        position: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "var-1-3",
        product_id: "prod-1",
        sku: "EAC-EX5-3BAT",
        price: 119.99,
        compare_at_price: 219.99,
        cost: 65.00,
        stock: 14,
        low_stock_threshold: 3,
        weight: 0.65,
        attributes: { Battery: "3 Batteries (90min)", StorageBag: "Included" },
        image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-GZ-4419-3B",
        is_active: true,
        position: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-2",
    title: "BlitzWolf BW-WA3 Pro 120W Bluetooth 5.0 Wireless Speaker with RGB Light & Quad Drivers",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    sku: "BW-WA3-PRO-120W",
    short_description: "Huge 120W output, DSP heavy bass, 16000mAh emergency powerbank capability, and TWS stereo pairing.",
    description: `### Extreme Audio Powerhouse
120W quad driver acoustics with dual passive radiators deliver heart-thumping bass and crisp highs. Waterproof IPX5 rating makes it ready for outdoor parties.`,
    category_id: "cat-1",
    brand_id: "brand-2",
    base_price: 69.50,
    compare_at_price: 119.00,
    cost: 38.00,
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    tags: ["speaker", "bluetooth", "120w", "rgb", "waterproof"],
    weight: 1.85,
    dimensions: { length: 28, width: 11, height: 11 },
    shipping_origin: "Shenzhen, China",
    hs_code: "85182200",
    supplier_code: "SUP-SZ-9021",
    seo_title: "BlitzWolf BW-WA3 Pro 120W RGB Bluetooth Speaker - Lennox ChinaMall",
    seo_description: "Party speaker with 120W output, 16000mAh battery and RGB light show in USDT.",
    avg_rating: 4.9,
    review_count: 176,
    sold_count: 2430,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-2-1", product_id: "prod-2", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80", alt: "BlitzWolf 120W Speaker Front View", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-2-2", product_id: "prod-2", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", alt: "Audio Engineering and Bass Drivers", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    videos: [
      { id: "v-2-1", product_id: "prod-2", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov", type: "uploaded", position: 1, title: "Video 1: Bass Test & Decibel Measurement", created_at: new Date().toISOString() },
      { id: "v-2-2", product_id: "prod-2", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov", type: "uploaded", position: 2, title: "Video 2: IPX5 Water Splash Demonstration", created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-2-1",
        product_id: "prod-2",
        sku: "BW-WA3-PRO-STD",
        price: 69.50,
        compare_at_price: 119.00,
        cost: 38.00,
        stock: 50,
        low_stock_threshold: 8,
        weight: 1.85,
        attributes: { Color: "Midnight Black", Mic: "Standard" },
        image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-9021-STD",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "var-2-2",
        product_id: "prod-2",
        sku: "BW-WA3-PRO-MIC",
        price: 84.50,
        compare_at_price: 139.00,
        cost: 46.00,
        stock: 28,
        low_stock_threshold: 5,
        weight: 2.1,
        attributes: { Color: "Midnight Black", Mic: "2x Wireless Karaoke Mics" },
        image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-9021-MIC",
        is_active: true,
        position: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-3",
    title: "Creality Ender-3 V3 SE High-Speed Auto-Leveling 3D Printer 250mm/s",
    slug: "creality-ender-3-v3-se-3d-printer",
    sku: "CRE-E3V3SE-US",
    short_description: "High speed 250mm/s 3D printer with Sprite direct extruder, CR Touch auto-leveling, and dual Z-axis stabilization.",
    description: `### Next-Gen Fast 3D Printing for Everyone
Assemble and print in under 20 minutes with automatic bed leveling and strain sensor Z-offset calibration.`,
    category_id: "cat-3",
    brand_id: "brand-3",
    base_price: 179.00,
    compare_at_price: 269.00,
    cost: 112.00,
    status: "published",
    is_featured: true,
    is_best_seller: false,
    is_new_arrival: true,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    tags: ["3dprinter", "creality", "diy", "maker", "high-speed"],
    weight: 7.2,
    dimensions: { length: 45, width: 40, height: 50 },
    shipping_origin: "Shenzhen, China",
    hs_code: "84771010",
    supplier_code: "SUP-SZ-CRE-88",
    seo_title: "Creality Ender 3 V3 SE 3D Printer - Factory Direct Sourcing",
    seo_description: "Buy Creality Ender-3 V3 SE direct from China. Fast 250mm/s printing, CR Touch auto-leveling in USDT.",
    avg_rating: 4.88,
    review_count: 94,
    sold_count: 810,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-3-1", product_id: "prod-3", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80", alt: "Creality 3D Printer Operating", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-3-2", product_id: "prod-3", url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80", alt: "Sprite Direct Drive Extruder", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    videos: [
      { id: "v-3-1", product_id: "prod-3", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov", type: "uploaded", position: 1, title: "Video 1: 20-Minute Quick Setup & Bed Leveling", created_at: new Date().toISOString() },
      { id: "v-3-2", product_id: "prod-3", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov", type: "uploaded", position: 2, title: "Video 2: High Speed 250mm/s Benchy Speedrun", created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-3-1",
        product_id: "prod-3",
        sku: "CRE-E3V3SE-STD",
        price: 179.00,
        compare_at_price: 269.00,
        cost: 112.00,
        stock: 18,
        low_stock_threshold: 4,
        weight: 7.2,
        attributes: { Plug: "US Plug (110V-220V)", Bundle: "Standard Kit" },
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-CRE-88-US",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "var-3-2",
        product_id: "prod-3",
        sku: "CRE-E3V3SE-FIL",
        price: 209.00,
        compare_at_price: 310.00,
        cost: 130.00,
        stock: 12,
        low_stock_threshold: 3,
        weight: 9.2,
        attributes: { Plug: "US Plug (110V-220V)", Bundle: "+ 2KG PLA+ Filament Pack" },
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-CRE-88-FIL",
        is_active: true,
        position: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-4",
    title: "Astrolux FT03S SFH55 9300LM 927M Ultra Powerful Long-Throw EDC Tactical Flashlight",
    slug: "astrolux-ft03s-9300lm-tactical-flashlight",
    sku: "AST-FT03S-9300",
    short_description: "Monster 9300 lumens output with 927 meters beam throw, Anduril 2 UI, Type-C 2A fast recharge, and 26650 battery.",
    description: `### Extreme Distance Search & Rescue Torch
Equipped with the massive SFH55 LED core, producing raw lighting power comparable to automotive headlights. Solid aerospace aluminum CNC construction.`,
    category_id: "cat-6",
    brand_id: "brand-4",
    base_price: 54.99,
    compare_at_price: 95.00,
    cost: 29.50,
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    tags: ["flashlight", "tactical", "9300lm", "edc", "outdoor"],
    weight: 0.38,
    dimensions: { length: 17, width: 7, height: 7 },
    shipping_origin: "Dongguan, China",
    hs_code: "85131000",
    supplier_code: "SUP-DG-ASTRO",
    seo_title: "Astrolux FT03S 9300LM Long Throw Flashlight - Lennox ChinaMall",
    seo_description: "Buy Astrolux FT03S 9300 lumens EDC flashlight with 927m beam throw in USDT.",
    avg_rating: 4.92,
    review_count: 312,
    sold_count: 3840,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-4-1", product_id: "prod-4", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80", alt: "Astrolux Tactical Flashlight Beam", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-4-2", product_id: "prod-4", url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80", alt: "Aluminum Head & Cooling Fins", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    videos: [
      { id: "v-4-1", product_id: "prod-4", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov", type: "uploaded", position: 1, title: "Video 1: 900-Meter Night Beam Distance Test", created_at: new Date().toISOString() },
      { id: "v-4-2", product_id: "prod-4", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov", type: "uploaded", position: 2, title: "Video 2: Anduril 2 UI Ramping & Strobe Guide", created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-4-1",
        product_id: "prod-4",
        sku: "AST-FT03S-5700K",
        price: 54.99,
        compare_at_price: 95.00,
        cost: 29.50,
        stock: 45,
        low_stock_threshold: 6,
        weight: 0.38,
        attributes: { Tint: "5700K Natural White", Battery: "Include 5000mAh 26650" },
        image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-DG-ASTRO-57",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "var-4-2",
        product_id: "prod-4",
        sku: "AST-FT03S-6500K",
        price: 54.99,
        compare_at_price: 95.00,
        cost: 29.50,
        stock: 30,
        low_stock_threshold: 6,
        weight: 0.38,
        attributes: { Tint: "6500K Cool White (Max Lumens)", Battery: "Include 5000mAh 26650" },
        image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-DG-ASTRO-65",
        is_active: true,
        position: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-5",
    title: "Topshak TS-ESD4 20V Cordless Brushless Impact Wrench & Screwdriver Drill Kit",
    slug: "topshak-ts-esd4-20v-brushless-impact-wrench",
    sku: "TOP-TS-ESD4-KIT",
    short_description: "Heavy duty 350N.m torque, variable speed trigger, LED worklight, and 2x 2000mAh lithium power packs.",
    description: `### Workshop Grade Power in Your Hands
Built for automotive repair, DIY fabrication, and construction. High efficiency brushless motor eliminates brush wear and optimizes runtime.`,
    category_id: "cat-3",
    brand_id: "brand-5",
    base_price: 49.99,
    compare_at_price: 89.99,
    cost: 26.00,
    status: "published",
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: true,
    is_flash_deal: true,
    flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    tags: ["tools", "impact wrench", "drill", "brushless", "cordless"],
    weight: 2.4,
    dimensions: { length: 30, width: 25, height: 10 },
    shipping_origin: "Zhejiang, China",
    hs_code: "84672100",
    supplier_code: "SUP-ZJ-TOP-44",
    seo_title: "Topshak TS-ESD4 20V Brushless Impact Wrench - Lennox ChinaMall",
    seo_description: "Buy Topshak 20V 350N.m impact wrench kit with dual batteries directly in USDT.",
    avg_rating: 4.78,
    review_count: 85,
    sold_count: 620,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-5-1", product_id: "prod-5", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80", alt: "Topshak Impact Wrench Tool in Workshop", type: "image", position: 1, created_at: new Date().toISOString() }
    ],
    videos: [
      { id: "v-5-1", product_id: "prod-5", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov", type: "uploaded", position: 1, title: "Video 1: Lug Nut Removal & Torque Stress Test", created_at: new Date().toISOString() },
      { id: "v-5-2", product_id: "prod-5", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov", type: "uploaded", position: 2, title: "Video 2: Accessory Kit Overview & Socket Set", created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-5-1",
        product_id: "prod-5",
        sku: "TOP-TS-ESD4-2BAT",
        price: 49.99,
        compare_at_price: 89.99,
        cost: 26.00,
        stock: 40,
        low_stock_threshold: 5,
        weight: 2.4,
        attributes: { Batteries: "2x 20V 2.0Ah Packs", Case: "Hard Blow-Mold Case" },
        image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-ZJ-TOP-44-2B",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-6",
    title: "KONNWEI KW850 OBD2 Car Diagnostic Scanner Code Reader with Live Data Stream",
    slug: "konnwei-kw850-obd2-car-diagnostic-scanner",
    sku: "KON-KW850-PRO",
    short_description: "Universal OBDII / EOBD engine fault code scanner with 2.8\" TFT color screen, one-click I/M readiness, and battery health tester.",
    description: `### Professional Auto Mechanic in Your Glovebox
Diagnose Check Engine Light (MIL), read and clear freeze frame data, live sensor waveforms, O2 sensor tests, and EVAP leak diagnostics across all 1996+ OBD2 vehicles.`,
    category_id: "cat-5",
    brand_id: null,
    base_price: 32.99,
    compare_at_price: 59.99,
    cost: 16.50,
    status: "published",
    is_featured: false,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: false,
    flash_deal_ends_at: null,
    tags: ["automotive", "obd2", "scanner", "car repair", "diagnostic"],
    weight: 0.52,
    dimensions: { length: 20, width: 10, height: 4 },
    shipping_origin: "Shenzhen, China",
    hs_code: "90318090",
    supplier_code: "SUP-SZ-KONN-01",
    seo_title: "KONNWEI KW850 OBD2 Scanner - Factory Direct in USDT",
    seo_description: "Diagnose car trouble codes with KONNWEI KW850 color scanner direct from China factory.",
    avg_rating: 4.81,
    review_count: 142,
    sold_count: 1560,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-6-1", product_id: "prod-6", url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80", alt: "Automotive Diagnostic Scanner Connected to Car", type: "image", position: 1, created_at: new Date().toISOString() }
    ],
    videos: [
      { id: "v-6-1", product_id: "prod-6", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov", type: "uploaded", position: 1, title: "Video 1: Check Engine Code Reading & Reset Demo", created_at: new Date().toISOString() },
      { id: "v-6-2", product_id: "prod-6", url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov", type: "uploaded", position: 2, title: "Video 2: Live Sensor O2 & Battery Graphing", created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-6-1",
        product_id: "prod-6",
        sku: "KON-KW850-RED",
        price: 32.99,
        compare_at_price: 59.99,
        cost: 16.50,
        stock: 60,
        low_stock_threshold: 10,
        weight: 0.52,
        attributes: { Color: "Racing Red & Black" },
        image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-KONN-01-R",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-7",
    title: "LaserPecker 2 Super Fast Handheld Laser Engraver & 5W Metal Wood Cutter",
    slug: "laserpecker-2-handheld-laser-engraver",
    sku: "LP-2-PRO-SET",
    short_description: "Ultra-fast 36000mm/min preview speed, 0.05mm compressed spot, power bank compatible portable engraver.",
    description: `### Flagship Ultra-Fast Dual-Galvo Laser System
Engineered for metal, wood, leather, acrylic and cylindrical engraving with high precision electric stand.`,
    category_id: "cat-3",
    brand_id: null,
    base_price: 389.00,
    compare_at_price: 649.00,
    cost: 210.00,
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: false,
    flash_deal_ends_at: null,
    tags: ["laser", "engraver", "cnc", "maker", "portable"],
    weight: 1.8,
    dimensions: { length: 26, width: 22, height: 18 },
    shipping_origin: "Shenzhen, China",
    hs_code: "84561100",
    supplier_code: "SUP-SZ-LP-02",
    seo_title: "LaserPecker 2 Handheld Laser Engraver - Direct from China",
    seo_description: "Buy LaserPecker 2 portable laser engraver and cutter at factory price with USDT.",
    avg_rating: 4.92,
    review_count: 312,
    sold_count: 2480,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-7-1", product_id: "prod-7", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80", alt: "Laser Engraver in Action", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-7-2", product_id: "prod-7", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80", alt: "Laser Engraved Metal and Wood Samples", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-7-1",
        product_id: "prod-7",
        sku: "LP-2-STD",
        price: 389.00,
        compare_at_price: 649.00,
        cost: 210.00,
        stock: 25,
        low_stock_threshold: 4,
        weight: 1.8,
        attributes: { Package: "Standard Stand Kit" },
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-LP-02-STD",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-8",
    title: "TS101 Smart OLED USB-C 65W PD/DC Portable Soldering Iron Station",
    slug: "ts101-smart-usbc-soldering-iron",
    sku: "MIN-TS101-GRY",
    short_description: "Upgraded 65W/90W dual power input soldering pencil with boost temperature turbo mode and anti-slip grip.",
    description: `### Essential Precision Soldering Tool for Drone & Electronics Builders
Heats from room temperature to 350°C in just 9 seconds. Supports PD 65W power bank operations.`,
    category_id: "cat-3",
    brand_id: null,
    base_price: 49.99,
    compare_at_price: 89.99,
    cost: 24.50,
    status: "published",
    is_featured: false,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: false,
    flash_deal_ends_at: null,
    tags: ["soldering", "electronics", "diy", "tools", "fpv repair"],
    weight: 0.18,
    dimensions: { length: 16, width: 6, height: 3 },
    shipping_origin: "Dongguan, China",
    hs_code: "85151100",
    supplier_code: "SUP-DG-MIN-101",
    seo_title: "TS101 Smart Portable Soldering Iron - Factory Price",
    seo_description: "Buy TS101 OLED USB-C soldering pencil direct from factory with USDT.",
    avg_rating: 4.88,
    review_count: 420,
    sold_count: 3650,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-8-1", product_id: "prod-8", url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80", alt: "TS101 Soldering Iron Precision Tip", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-8-2", product_id: "prod-8", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", alt: "Circuit Board Soldering Close-up", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-8-1",
        product_id: "prod-8",
        sku: "TS101-B2-TIP",
        price: 49.99,
        compare_at_price: 89.99,
        cost: 24.50,
        stock: 80,
        low_stock_threshold: 15,
        weight: 0.18,
        attributes: { Tip: "B2 Conical Tip" },
        image_url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-DG-MIN-101-B2",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-9",
    title: "SJRC F22S 4K Pro 2-Axis Mechanical Gimbal EIS 3.5km Range Long Distance Drone",
    slug: "sjrc-f22s-4k-pro-long-distance-drone",
    sku: "SJR-F22S-4K",
    short_description: "Long range 3.5km digital image transmission drone with laser obstacle avoidance and 35min flight time.",
    description: `### Professional Long-Range Aerial Explorer
Equipped with forward laser radar avoidance, 2-axis mechanical stabilization gimbal, and 4K 30fps HDR video capture.`,
    category_id: "cat-2",
    brand_id: "brand-1",
    base_price: 239.00,
    compare_at_price: 420.00,
    cost: 135.00,
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: false,
    flash_deal_ends_at: null,
    tags: ["drone", "4k", "gimbal", "obstacle avoidance", "long range"],
    weight: 0.58,
    dimensions: { length: 30, width: 24, height: 9 },
    shipping_origin: "Shenzhen, China",
    hs_code: "88062200",
    supplier_code: "SUP-SZ-SJRC-22",
    seo_title: "SJRC F22S 4K Pro Drone - Direct Factory Sourcing",
    seo_description: "Buy SJRC F22S 4K Pro drone with 3.5km range in USDT with zero fee.",
    avg_rating: 4.89,
    review_count: 198,
    sold_count: 1420,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-9-1", product_id: "prod-9", url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80", alt: "SJRC F22S High Altitude Flight", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-9-2", product_id: "prod-9", url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80", alt: "Drone in Hover Position", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-9-1",
        product_id: "prod-9",
        sku: "SJR-F22S-2BAT",
        price: 239.00,
        compare_at_price: 420.00,
        cost: 135.00,
        stock: 40,
        low_stock_threshold: 6,
        weight: 0.58,
        attributes: { Battery: "2 Batteries + Bag" },
        image_url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-SZ-SJRC-22-2B",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "prod-10",
    title: "Anker Soundcore Motion Boom Plus 80W Heavy Bass IP67 Outdoor Speaker",
    slug: "anker-soundcore-motion-boom-plus-80w",
    sku: "ANK-MB-PLUS-80",
    short_description: "Massive 80W stereo sound with BassUp technology, titanium drivers, 20-hour playtime, and built-in power bank.",
    description: `### Legendary Outdoor Sound System
Dual 30W woofers and 10W tweeters with IP67 dust/water resistance and partycast 2.0 synchronisation.`,
    category_id: "cat-1",
    brand_id: "brand-2",
    base_price: 139.99,
    compare_at_price: 229.99,
    cost: 78.00,
    status: "published",
    is_featured: true,
    is_best_seller: true,
    is_new_arrival: false,
    is_flash_deal: false,
    flash_deal_ends_at: null,
    tags: ["audio", "speaker", "bluetooth", "ip67", "soundcore"],
    weight: 2.2,
    dimensions: { length: 38, width: 14, height: 19 },
    shipping_origin: "Dongguan, China",
    hs_code: "85182200",
    supplier_code: "SUP-DG-ANK-09",
    seo_title: "Soundcore Motion Boom Plus 80W Speaker - Direct Sourcing",
    seo_description: "Buy Motion Boom Plus 80W heavy bass speaker direct in USDT.",
    avg_rating: 4.95,
    review_count: 580,
    sold_count: 4890,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(),
    updated_at: new Date().toISOString(),
    media: [
      { id: "m-10-1", product_id: "prod-10", url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80", alt: "Motion Boom Plus Rugged Speaker", type: "image", position: 1, created_at: new Date().toISOString() },
      { id: "m-10-2", product_id: "prod-10", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", alt: "Speaker in Outdoor Environment", type: "image", position: 2, created_at: new Date().toISOString() }
    ],
    variants: [
      {
        id: "var-10-1",
        product_id: "prod-10",
        sku: "ANK-MB-PLUS-BLK",
        price: 139.99,
        compare_at_price: 229.99,
        cost: 78.00,
        stock: 55,
        low_stock_threshold: 10,
        weight: 2.2,
        attributes: { Color: "Midnight Black" },
        image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80",
        supplier_code: "SUP-DG-ANK-09-BLK",
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    code: "SUP-GZ-4419",
    name: "Guangzhou Eachine Drone Manufacturing Co., Ltd.",
    contact: "Ms. Chen (WeChat: eachine_drone_direct)",
    platform: "1688 / Factory Direct",
    source_url: "https://1688.com",
    region: "Guangzhou, Guangdong",
    lead_time_days: 2,
    reliability_notes: "Grade A supplier. Same day dispatch for drone units. 99.4% quality pass rate.",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sup-2",
    code: "SUP-SZ-9021",
    name: "Shenzhen BlitzWolf Acoustic Technologies",
    contact: "Mr. Lin (WhatsApp: +86 138 0000 8888)",
    platform: "AliExpress Wholesale / Direct",
    source_url: "https://aliexpress.com",
    region: "Shenzhen, Guangdong",
    lead_time_days: 1,
    reliability_notes: "Excellent audio manufacturer with international CE/FCC/RoHS certificates.",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sup-3",
    code: "SUP-SZ-CRE-88",
    name: "Creality 3D Official Sourcing Hub",
    contact: "Direct Channel B2B",
    platform: "Creality B2B China Portal",
    source_url: "https://creality.cn",
    region: "Shenzhen, Guangdong",
    lead_time_days: 3,
    reliability_notes: "Official distributor channel. Includes 1-year factory warranty guarantee.",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    order_number: "LCM-20260823-88AF",
    user_id: "user-1",
    status: "paid",
    subtotal: 89.99,
    discount: 0,
    shipping_cost: 0,
    total: 89.99,
    currency: "USDT",
    coupon_id: null,
    notes: "Please pack with extra corner guards.",
    internal_notes: "Verified payment via Binance Pay (Txn #BP889230198). Sourcing from Guangzhou SUP-GZ-4419.",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    updated_at: new Date().toISOString()
  },
  {
    id: "ord-2",
    order_number: "LCM-20260822-77BC",
    user_id: "user-2",
    status: "sourcing",
    subtotal: 124.49,
    discount: 10.00,
    shipping_cost: 0,
    total: 114.49,
    currency: "USDT",
    coupon_id: "coup-1",
    notes: null,
    internal_notes: "Placed order with Shenzhen supplier. Supplier PO #1688-99238120.",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ord-3",
    order_number: "LCM-20260820-33EE",
    user_id: "user-3",
    status: "shipped",
    subtotal: 54.99,
    discount: 0,
    shipping_cost: 0,
    total: 54.99,
    currency: "USDT",
    coupon_id: null,
    notes: null,
    internal_notes: "Shipped via Yanwen Express Line tracking YW8892104938CN.",
    assigned_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface PromotionCampaign {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  discountBadge: string;
  bgGradient: string;
  imageUrl: string;
  is_active: boolean;
  position: number;
  ends_at: string;
}

export const MOCK_BANNERS: PromotionCampaign[] = [
  {
    id: "camp-1",
    title: "Shenzhen Precision Robotics & 4K GPS Drones",
    subtitle: "Direct Factory Pricing with Zero-Fee Binance Pay USDT Settlement & 7-12 Days Air Cargo",
    badge: "FACTORY SOURCING DROP",
    ctaText: "Source Now with USDT",
    ctaLink: "/categories/rc-drones-toys",
    discountBadge: "UP TO 50% OFF",
    bgGradient: "from-[#00143D] via-[#002266] to-[#00143D]",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    position: 1,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "camp-2",
    title: "High-Speed CoreXY 3D Printers & Industrial Lasers",
    subtitle: "600mm/s Creality, Two Trees & Kingroon Official Sourced Hardware Tested in Shenzhen Labs",
    badge: "MAKER & INDUSTRIAL",
    ctaText: "Explore 3D Printers",
    ctaLink: "/categories/tools-diy-hardware",
    discountBadge: "SAVE $120 USDT",
    bgGradient: "from-slate-900 via-indigo-950 to-[#00143D]",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    position: 2,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "camp-3",
    title: "Direct Auto Diagnostic & Smart Mobility Hub",
    subtitle: "Bidirectional OBD2 scanners, 4K dashcams & portable jump starters with DDP tax-free shipping",
    badge: "AUTOMOTIVE DROP",
    ctaText: "Shop Auto Hardware",
    ctaLink: "/categories/automotive-e-mobility",
    discountBadge: "FLASH DROP -40%",
    bgGradient: "from-[#00143D] via-blue-950 to-slate-950",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    position: 3,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
  },
];

export interface PromotionCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  value: number; // 10 (%) or 5 ($)
  minSpend: number;
  maxUses: number;
  usageCount: number;
  description: string;
  expiresAt: string;
  isActive: boolean;
}

export const MOCK_COUPONS: PromotionCoupon[] = [
  {
    id: "coup-1",
    code: "LENNOX10",
    discountType: "percentage",
    value: 10,
    minSpend: 50,
    maxUses: 1000,
    usageCount: 428,
    description: "10% off on all direct factory electronics and drone hardware",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    isActive: true,
  },
  {
    id: "coup-2",
    code: "USDT5",
    discountType: "fixed_amount",
    value: 5,
    minSpend: 40,
    maxUses: 2000,
    usageCount: 1184,
    description: "$5 USDT instant discount on Binance Pay settlement",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
    isActive: true,
  },
  {
    id: "coup-3",
    code: "VIP20",
    discountType: "percentage",
    value: 20,
    minSpend: 150,
    maxUses: 200,
    usageCount: 65,
    description: "Exclusive 20% discount for VIP tier hardware buyers",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    isActive: true,
  },
  {
    id: "coup-4",
    code: "AIRFREE",
    discountType: "free_shipping",
    value: 0,
    minSpend: 80,
    maxUses: 500,
    usageCount: 290,
    description: "100% Free YunExpress Priority Air Express shipping",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
    isActive: true,
  },
];

// ─── High-Performance Memoized Data Access Layer ─────────────────────────────

const PRODUCT_SLUG_MAP = new Map<string, Product>();
const PRODUCT_ID_MAP = new Map<string, Product>();
const CATEGORY_SLUG_MAP = new Map<string, typeof MOCK_CATEGORIES[0]>();

// Pre-index collections
MOCK_PRODUCTS.forEach((p) => {
  PRODUCT_SLUG_MAP.set(p.slug, p);
  PRODUCT_ID_MAP.set(p.id, p);
});

MOCK_CATEGORIES.forEach((c) => {
  CATEGORY_SLUG_MAP.set(c.slug, c);
});

export function registerCachedProduct(product: Product) {
  if (!product) return;
  PRODUCT_SLUG_MAP.set(product.slug, product);
  PRODUCT_ID_MAP.set(product.id, product);
  const existingIdx = MOCK_PRODUCTS.findIndex((p) => p.id === product.id || p.slug === product.slug);
  if (existingIdx >= 0) {
    MOCK_PRODUCTS[existingIdx] = { ...MOCK_PRODUCTS[existingIdx], ...product };
  } else {
    MOCK_PRODUCTS.unshift(product);
  }
}

export function getCachedProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  if (PRODUCT_SLUG_MAP.has(slug)) return PRODUCT_SLUG_MAP.get(slug);
  return MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug || p.slug.includes(slug) || slug.includes(p.slug));
}

export function getCachedProductById(id: string): Product | undefined {
  if (!id) return undefined;
  return PRODUCT_ID_MAP.get(id) || MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
}

export function getCachedCategoryBySlug(slug: string) {
  return CATEGORY_SLUG_MAP.get(slug);
}

export function getCachedFlashDeals(limit = 6): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_flash_deal).slice(0, limit);
}

// ─── Attributes & Variants Mock Data ─────────────────────────────────────────

export interface AttributeGroup {
  id: string;
  name: string;
  code: string;
  type: "select" | "color" | "button" | "radio";
  values: string[];
  productCount: number;
  created_at: string;
}

export const MOCK_ATTRIBUTES: AttributeGroup[] = [
  {
    id: "attr-1",
    name: "Battery Configuration",
    code: "battery",
    type: "button",
    values: ["1 Battery (30min)", "2 Batteries (60min)", "3 Batteries (90min)", "4 Batteries + Quad Hub"],
    productCount: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
  },
  {
    id: "attr-2",
    name: "Storage & Case",
    code: "storage_case",
    type: "select",
    values: ["Standard Cardboard", "Waterproof Hard Shell", "Tactical EVA Travel Bag"],
    productCount: 28,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id: "attr-3",
    name: "LED Color Temperature",
    code: "color_temp",
    type: "color",
    values: ["5000K Neutral White", "6500K Cool White (High Lumen)", "3000K Warm Amber"],
    productCount: 19,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "attr-4",
    name: "Plug / Voltage Standard",
    code: "plug_type",
    type: "radio",
    values: ["US Standard 110V", "EU Plug 220V", "UK 3-Pin 230V", "AU Standard 240V"],
    productCount: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: "attr-5",
    name: "Tool Pack Setup",
    code: "tool_pack",
    type: "select",
    values: ["Bare Tool (No Battery)", "Kit with 1x 2.0Ah Pack", "Pro Kit with 2x 4.0Ah Packs & Fast Charger"],
    productCount: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

// ─── Inventory Stock Mock Data ───────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  category: string;
  shenzhenStock: number;
  guangzhouStock: number;
  hkAirStock: number;
  totalStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  unitCost: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "reordering";
  supplierCode: string;
  lastRestocked: string;
}

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "EAC-EX5-1BAT",
    productTitle: "Eachine EX5 4K GPS FPV Brushless Drone",
    variantTitle: "1 Battery / Standard",
    category: "RC Drones & Toys",
    shenzhenStock: 25,
    guangzhouStock: 10,
    hkAirStock: 5,
    totalStock: 40,
    reservedStock: 5,
    lowStockThreshold: 10,
    reorderPoint: 15,
    unitCost: 48.50,
    status: "in_stock",
    supplierCode: "SUP-GZ-4419",
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "inv-2",
    sku: "EAC-EX5-3BAT",
    productTitle: "Eachine EX5 4K GPS FPV Brushless Drone",
    variantTitle: "3 Batteries / Tactical EVA Case",
    category: "RC Drones & Toys",
    shenzhenStock: 6,
    guangzhouStock: 2,
    hkAirStock: 1,
    totalStock: 9,
    reservedStock: 4,
    lowStockThreshold: 10,
    reorderPoint: 15,
    unitCost: 65.00,
    status: "low_stock",
    supplierCode: "SUP-GZ-4419",
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: "inv-3",
    sku: "BW-WA3-PRO-120W",
    productTitle: "BlitzWolf BW-WA3 Pro 120W Bluetooth Speaker",
    variantTitle: "Default Quad Driver RGB",
    category: "Consumer Electronics",
    shenzhenStock: 38,
    guangzhouStock: 14,
    hkAirStock: 8,
    totalStock: 60,
    reservedStock: 6,
    lowStockThreshold: 15,
    reorderPoint: 20,
    unitCost: 42.00,
    status: "in_stock",
    supplierCode: "SUP-SZ-9021",
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "inv-4",
    sku: "CRE-K1-MAX-600",
    productTitle: "Creality K1 Max 600mm/s AI Dual LiDAR 3D Printer",
    variantTitle: "US 110V / Camera Kit",
    category: "Tools & DIY Hardware",
    shenzhenStock: 3,
    guangzhouStock: 0,
    hkAirStock: 1,
    totalStock: 4,
    reservedStock: 2,
    lowStockThreshold: 5,
    reorderPoint: 8,
    unitCost: 460.00,
    status: "low_stock",
    supplierCode: "SUP-SZ-CRE-88",
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
  },
  {
    id: "inv-5",
    sku: "AST-FT03S-6500K",
    productTitle: "Astrolux FT03S SFH55 9300LM Super Thrower Flashlight",
    variantTitle: "6500K Cool White / 26650 Cell",
    category: "Outdoor & Tactical",
    shenzhenStock: 22,
    guangzhouStock: 8,
    hkAirStock: 4,
    totalStock: 34,
    reservedStock: 3,
    lowStockThreshold: 8,
    reorderPoint: 12,
    unitCost: 29.50,
    status: "in_stock",
    supplierCode: "SUP-DG-ASTRO",
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

// ─── Media Library Assets Mock Data ──────────────────────────────────────────

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: string;
  dimensions?: string;
  format: string;
  category: "product" | "banner" | "dual-video" | "review" | "brand";
  uploaded_at: string;
}

export const MOCK_MEDIA: MediaAsset[] = [
  {
    id: "med-v1",
    name: "2026-04-30-69f399744ce0c",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
    type: "video",
    size: "11.5 MB",
    dimensions: "1080x1920",
    format: "MOV",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-v2",
    name: "2026-04-30-69f39980682e5",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
    type: "video",
    size: "51.4 MB",
    dimensions: "1080x1920",
    format: "MOV",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-5",
    name: "lennox-hero-promo-banner.jpg",
    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&auto=format&fit=crop&q=80",
    type: "image",
    size: "1.8 MB",
    dimensions: "1920x600",
    format: "JPG",
    category: "banner",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "med-4",
    name: "drone-flight-test-qc.mp4",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
    type: "video",
    size: "42.8 MB",
    dimensions: "1080p (60fps)",
    format: "MP4 / Dual-Video",
    category: "dual-video",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "med-1",
    name: "eachine-ex5-4k-hero.jpg",
    url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
    type: "image",
    size: "1.4 MB",
    dimensions: "1920x1080",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "med-2",
    name: "blitzwolf-speaker-rgb.jpg",
    url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80",
    type: "image",
    size: "2.1 MB",
    dimensions: "2400x1600",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "med-3",
    name: "creality-k1-3d-lab.jpg",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    type: "image",
    size: "3.2 MB",
    dimensions: "3000x2000",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

// ─── Sourcing & Purchase Orders (PO) Mock Data ───────────────────────────────

export interface SourcingPO {
  id: string;
  poNumber: string;
  orderNumber: string;
  supplierCode: string;
  supplierName: string;
  supplierPlatform: string;
  supplierItemUrl: string;
  productTitle: string;
  quantity: number;
  factoryUnitCost: number;
  totalCostUSDT: number;
  buyerAdmin: string;
  status: "pending_po" | "ordered" | "factory_dispatched" | "qc_received" | "issue";
  trackingOrPoRef: string;
  orderDate: string;
  expectedDeliveryToHub: string;
}

export const MOCK_SOURCING_POS: SourcingPO[] = [
  {
    id: "po-101",
    poNumber: "PO-20260824-001",
    orderNumber: "LCM-20260823-88AF",
    supplierCode: "SUP-GZ-4419",
    supplierName: "Guangzhou Eachine Drone Mfg",
    supplierPlatform: "1688 Direct B2B",
    supplierItemUrl: "https://1688.com/item/694829104.html",
    productTitle: "Eachine EX5 4K GPS FPV Brushless Drone (1 Battery)",
    quantity: 1,
    factoryUnitCost: 48.50,
    totalCostUSDT: 48.50,
    buyerAdmin: "Arifur (Shenzhen Lead)",
    status: "ordered",
    trackingOrPoRef: "1688-PO-8829104",
    orderDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expectedDeliveryToHub: "Aug 26, 2026",
  },
  {
    id: "po-102",
    poNumber: "PO-20260823-089",
    orderNumber: "LCM-20260822-77BC",
    supplierCode: "SUP-SZ-9021",
    supplierName: "Shenzhen BlitzWolf Acoustic Tech",
    supplierPlatform: "AliExpress Wholesale",
    supplierItemUrl: "https://aliexpress.com/item/10050091823.html",
    productTitle: "BlitzWolf BW-WA3 Pro 120W Bluetooth Speaker",
    quantity: 2,
    factoryUnitCost: 42.00,
    totalCostUSDT: 84.00,
    buyerAdmin: "Chen Wei (Procurement)",
    status: "qc_received",
    trackingOrPoRef: "SF-8891204899CN",
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    expectedDeliveryToHub: "Aug 24, 2026",
  },
  {
    id: "po-103",
    poNumber: "PO-20260822-044",
    orderNumber: "LCM-20260820-33EE",
    supplierCode: "SUP-DG-ASTRO",
    supplierName: "Dongguan Astrolux Optics Co.",
    supplierPlatform: "Taobao Factory",
    supplierItemUrl: "https://taobao.com/item/582910488.html",
    productTitle: "Astrolux FT03S SFH55 9300LM Super Thrower",
    quantity: 1,
    factoryUnitCost: 29.50,
    totalCostUSDT: 29.50,
    buyerAdmin: "Arifur (Shenzhen Lead)",
    status: "factory_dispatched",
    trackingOrPoRef: "ZTO-5520194820CN",
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    expectedDeliveryToHub: "Aug 23, 2026",
  },
];

// ─── Shipping & Air Cargo Tracking Mock Data ─────────────────────────────────

export interface ShippingParcel {
  id: string;
  trackingNumber: string;
  carrier: string;
  orderNumber: string;
  recipientName: string;
  destinationCountry: string;
  serviceType: "YunExpress Priority Air" | "Yanwen Special Line" | "4PX Global Direct" | "SF International";
  weightKg: number;
  currentStatus: "in_transit" | "customs_cleared" | "departed_hkg" | "out_for_delivery" | "delivered";
  latestEvent: string;
  latestEventTime: string;
  estimatedDelivery: string;
  ddpTaxPaid: boolean;
}

export const MOCK_SHIPPING: ShippingParcel[] = [
  {
    id: "shp-1",
    trackingNumber: "YUN-982741920-US",
    carrier: "YunExpress Air Cargo",
    orderNumber: "LCM-20260823-88AF",
    recipientName: "Alex Harrison",
    destinationCountry: "United States (CA)",
    serviceType: "YunExpress Priority Air",
    weightKg: 0.85,
    currentStatus: "in_transit",
    latestEvent: "Departed Shenzhen Sort Facility -> Transferred to HKG Air Hub",
    latestEventTime: "Aug 24, 09:15 AM",
    estimatedDelivery: "Sep 02, 2026",
    ddpTaxPaid: true,
  },
  {
    id: "shp-2",
    trackingNumber: "YW-8892104938-CN",
    carrier: "Yanwen Special Line",
    orderNumber: "LCM-20260820-33EE",
    recipientName: "Marcus Vance",
    destinationCountry: "United Kingdom (London)",
    serviceType: "Yanwen Special Line",
    weightKg: 0.42,
    currentStatus: "departed_hkg",
    latestEvent: "Flight CZ431 Departed HKG -> In Flight to London Heathrow (LHR)",
    latestEventTime: "Aug 23, 18:40 PM",
    estimatedDelivery: "Aug 29, 2026",
    ddpTaxPaid: true,
  },
  {
    id: "shp-3",
    trackingNumber: "4PX-3918204910-DE",
    carrier: "4PX Global Direct",
    orderNumber: "LCM-20260818-11AA",
    recipientName: "Klaus Schmidt",
    destinationCountry: "Germany (Frankfurt)",
    serviceType: "4PX Global Direct",
    weightKg: 3.10,
    currentStatus: "customs_cleared",
    latestEvent: "EU DDP Customs Clearance Completed Frankfurt Hub -> Handed to DHL DE",
    latestEventTime: "Aug 24, 11:20 AM",
    estimatedDelivery: "Aug 26, 2026",
    ddpTaxPaid: true,
  },
  {
    id: "shp-4",
    trackingNumber: "SF-9918273618-AU",
    carrier: "SF International",
    orderNumber: "LCM-20260815-99ZZ",
    recipientName: "Liam O'Connor",
    destinationCountry: "Australia (Sydney)",
    serviceType: "SF International",
    weightKg: 1.25,
    currentStatus: "delivered",
    latestEvent: "Delivered to Front Door & Signed (Sydney NSW)",
    latestEventTime: "Aug 22, 14:10 PM",
    estimatedDelivery: "Delivered",
    ddpTaxPaid: true,
  },
];

// ─── Returns & Warranty RMA Claims Mock Data ─────────────────────────────────

export interface ReturnClaim {
  id: string;
  rmaNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  reason: string;
  defectDescription: string;
  evidenceType: "video_proof" | "photo_inspection";
  evidenceUrl: string;
  claimDate: string;
  status: "requested" | "under_review" | "approved" | "rejected" | "refunded";
  refundAmountUSDT: number;
  assignedInspector: string;
  resolutionNote?: string;
}

export const MOCK_RETURNS: ReturnClaim[] = [
  {
    id: "ret-1",
    rmaNumber: "RMA-2026-0812",
    orderNumber: "LCM-20260812-44DD",
    customerName: "Robert Taylor",
    customerEmail: "robert.t@outlook.com",
    productTitle: "BlitzWolf BW-WA3 Pro 120W Speaker",
    reason: "Bluetooth Audio Distortion on Right Subwoofer",
    defectDescription: "Right channel creates crackling buzz when volume goes above 65%. Recorded audio diagnostic video.",
    evidenceType: "video_proof",
    evidenceUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    claimDate: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    status: "under_review",
    refundAmountUSDT: 59.99,
    assignedInspector: "Support Desk Lead",
    resolutionNote: "Reviewing teardown audio proof submitted by buyer.",
  },
  {
    id: "ret-2",
    rmaNumber: "RMA-2026-0805",
    orderNumber: "LCM-20260805-12CC",
    customerName: "Elena Rostova",
    customerEmail: "elena.rostova@gmail.com",
    productTitle: "Eachine EX5 4K GPS Drone",
    reason: "Motor arm cracked during transit box impact",
    defectDescription: "Outer postal package had severe compression, rear left propeller arm cracked.",
    evidenceType: "photo_inspection",
    evidenceUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    claimDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    status: "approved",
    refundAmountUSDT: 89.99,
    assignedInspector: "Support Desk Lead",
    resolutionNote: "Approved factory replacement warranty claim under 30-day policy.",
  },
];

// ─── Customer Reviews Mock Data ──────────────────────────────────────────────

export interface AdminReview {
  id: string;
  productTitle: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  hasMediaProof: boolean;
  status: "approved" | "pending" | "rejected";
  isFeatured: boolean;
  sellerReply?: string;
  createdAt: string;
}

export const MOCK_ADMIN_REVIEWS: AdminReview[] = [
  {
    id: "rev-1",
    productTitle: "Eachine EX5 4K GPS FPV Drone",
    customerName: "David Miller",
    rating: 5,
    title: "Incredible 4K range for under $100 USDT!",
    comment: "Flown it for 4 battery cycles in windy coastal conditions. Optical flow holding and GPS return home worked with zero drift. Best value direct factory purchase.",
    verifiedPurchase: true,
    hasMediaProof: true,
    status: "approved",
    isFeatured: true,
    sellerReply: "Thank you David! Factory QC firmware 2.4 update is now live on our support docs.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "rev-2",
    productTitle: "BlitzWolf BW-WA3 Pro 120W Speaker",
    customerName: "Samantha Reed",
    rating: 5,
    title: "Room shaking bass and instant Binance Pay checkout",
    comment: "Arrived in 9 days via YunExpress to Chicago. TWS pairing with a second unit turns my backyard into a concert hall.",
    verifiedPurchase: true,
    hasMediaProof: true,
    status: "approved",
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "rev-3",
    productTitle: "Topshak TS-ESD4 20V Impact Wrench",
    customerName: "Anonymous User",
    rating: 2,
    title: "Package arrived with crushed cardboard box",
    comment: "Tools work fine, but shipping outer box was beat up. Need better air bubble wrap from Guangzhou hub.",
    verifiedPurchase: true,
    hasMediaProof: false,
    status: "pending",
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

// ─── Support Tickets Mock Data ───────────────────────────────────────────────

export interface AdminTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string;
  category: "Air Shipping & Tracking" | "Binance Pay USDT" | "Factory Warranty 30-Day" | "Technical Setup";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedAgent: string;
  messagesCount: number;
  lastReply: string;
  createdAt: string;
}

export const MOCK_TICKETS: AdminTicket[] = [
  {
    id: "tck-1",
    ticketNumber: "TCK-88219",
    subject: "Inquiry on YunExpress tracking handover to USPS",
    customerName: "Alex Harrison",
    customerEmail: "alex.harrison@example.com",
    orderNumber: "LCM-20260823-88AF",
    category: "Air Shipping & Tracking",
    priority: "medium",
    status: "in_progress",
    assignedAgent: "Support Agent Desk",
    messagesCount: 3,
    lastReply: "YunExpress parcel cleared LAX customs and is scheduled for USPS local injection tomorrow.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "tck-2",
    ticketNumber: "TCK-88214",
    subject: "Binance Pay USDT network confirmation timeout question",
    customerName: "Michael Wong",
    customerEmail: "m.wong@techcorp.io",
    orderNumber: "LCM-20260822-77BC",
    category: "Binance Pay USDT",
    priority: "high",
    status: "open",
    assignedAgent: "Unassigned",
    messagesCount: 1,
    lastReply: "Payment verified on Binance Merchant portal, webhook callback synced.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "tck-3",
    ticketNumber: "TCK-88190",
    subject: "Creality K1 Max firmware update instructions request",
    customerName: "Frank Alvarez",
    customerEmail: "frank.a@makerhub.net",
    orderNumber: "LCM-20260818-11AA",
    category: "Technical Setup",
    priority: "low",
    status: "resolved",
    assignedAgent: "Shenzhen Tech Specialist",
    messagesCount: 4,
    lastReply: "Provided OTA firmware bin file and instructions. Customer confirmed printer is operating at 600mm/s.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// ─── Homepage Sections Builder Mock Data ─────────────────────────────────────

export interface AdminHomepageSection {
  id: string;
  type: string;
  name: string;
  subtitle: string;
  itemCount: number;
  position: number;
  isActive: boolean;
  layout: "carousel" | "grid" | "banner_strip" | "dual_video";
  configJson: string;
}

export const MOCK_HOMEPAGE_SECTIONS: AdminHomepageSection[] = [
  {
    id: "sec-1",
    type: "hero_banner",
    name: "Shenzhen Robotics & 4K Aerial Drones Spotlight",
    subtitle: "Full-width promotional carousel with USDT zero-fee checkout callouts",
    itemCount: 3,
    position: 1,
    isActive: true,
    layout: "carousel",
    configJson: '{"autoplay": true, "intervalSeconds": 6, "transition": "fade"}',
  },
  {
    id: "sec-2",
    type: "category_strip",
    name: "Featured Hardware Categories Rail",
    subtitle: "Quick navigation for 6 core factory sourcing lines",
    itemCount: 6,
    position: 2,
    isActive: true,
    layout: "grid",
    configJson: '{"columns": 6, "showProductCounts": true}',
  },
  {
    id: "sec-3",
    type: "flash_deals",
    name: "Flash Sourcing Deals & Live Countdown",
    subtitle: "Time-limited factory price drops with stock quota meters",
    itemCount: 4,
    position: 3,
    isActive: true,
    layout: "grid",
    configJson: '{"maxItems": 4, "showClaimedBar": true, "showTimer": true}',
  },
  {
    id: "sec-4",
    type: "dual_video_spotlight",
    name: "Dual-Video QC & Teardown Spotlight",
    subtitle: "Factory inspection and live performance dual-embed player",
    itemCount: 1,
    position: 4,
    isActive: true,
    layout: "dual_video",
    configJson: '{"featuredProductId": "prod-1", "autoPlayHover": false}',
  },
  {
    id: "sec-5",
    type: "trust_strip",
    name: "Binance Pay USDT & 30-Day Warranty Trust Badges",
    subtitle: "Zero gas fees, 7-12 day air cargo, factory direct warranty guarantees",
    itemCount: 4,
    position: 5,
    isActive: true,
    layout: "banner_strip",
    configJson: '{"style": "dark_card", "icons": ["Coins", "ShieldCheck", "Truck", "RotateCcw"]}',
  },
];

// ─── Static Pages / CMS Mock Data ────────────────────────────────────────────

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  category: "Policy" | "Company" | "Help";
  seoTitle: string;
  seoDescription: string;
  status: "published" | "draft";
  lastEditedBy: string;
  updatedAt: string;
  content: string;
}

export const MOCK_PAGES: AdminPage[] = [
  {
    id: "pg-1",
    title: "30-Day Factory Direct Warranty Policy",
    slug: "warranty-policy",
    category: "Policy",
    seoTitle: "30-Day Hardware Warranty & QC Policy - Lennox ChinaMall",
    seoDescription: "Comprehensive 30-day warranty coverage for all factory-direct electronics and aerial drones.",
    status: "published",
    lastEditedBy: "Super Admin",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    content: "# 30-Day Factory Direct Warranty Policy\n\nEvery hardware item sourced through Lennox ChinaMall is backed by our direct manufacturer warranty in Shenzhen and Guangzhou.",
  },
  {
    id: "pg-2",
    title: "Binance Pay USDT Settlement & 0-Fee Checkout",
    slug: "binance-pay-guide",
    category: "Help",
    seoTitle: "How to Pay with Binance Pay USDT - Lennox ChinaMall",
    seoDescription: "Step-by-step tutorial on instant zero-network-gas fee settlement via Binance Pay QR code.",
    status: "published",
    lastEditedBy: "Super Admin",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    content: "# Zero-Fee Crypto Checkout with Binance Pay\n\nExperience seamless USDT escrow settlement with instant order confirmation.",
  },
  {
    id: "pg-3",
    title: "DDP Air Cargo & Customs Clearance Guide",
    slug: "shipping-customs-ddp",
    category: "Help",
    seoTitle: "DDP Air Express Delivery - 7 to 12 Days Delivery",
    seoDescription: "Delivered Duty Paid (DDP) air cargo logistics with YunExpress, Yanwen, and SF International.",
    status: "published",
    lastEditedBy: "Order Manager Lead",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    content: "# Fast Air Cargo Logistics (DDP)\n\nAll import duties and tariffs are pre-cleared by our logistics routing engine.",
  },
];

// ─── Menus Builder Mock Data ─────────────────────────────────────────────────

export interface AdminMenu {
  id: string;
  name: string;
  location: "header_nav" | "footer_links" | "mobile_bottom" | "mega_menu";
  itemsCount: number;
  updatedAt: string;
  items: Array<{ id: string; label: string; href: string; isExternal?: boolean }>;
}

export const MOCK_MENUS: AdminMenu[] = [
  {
    id: "mnu-1",
    name: "Main Header Navigation",
    location: "header_nav",
    itemsCount: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    items: [
      { id: "mi-1", label: "Categories", href: "/categories" },
      { id: "mi-2", label: "Flash Deals", href: "/categories/rc-drones-toys" },
      { id: "mi-3", label: "New Sourced Hardware", href: "/categories/consumer-electronics" },
      { id: "mi-4", label: "Air Cargo Tracking", href: "/account/orders" },
      { id: "mi-5", label: "Binance Pay Info", href: "/help" },
    ],
  },
  {
    id: "mnu-2",
    name: "Footer Corporate & Warranty Links",
    location: "footer_links",
    itemsCount: 6,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    items: [
      { id: "mi-201", label: "30-Day Warranty", href: "/warranty-policy" },
      { id: "mi-202", label: "DDP Air Shipping", href: "/shipping-customs-ddp" },
      { id: "mi-203", label: "Binance Pay Guide", href: "/binance-pay-guide" },
      { id: "mi-204", label: "Help & Support Tickets", href: "/account/support" },
      { id: "mi-205", label: "Privacy Policy", href: "/privacy" },
      { id: "mi-206", label: "Terms of Service", href: "/terms" },
    ],
  },
];

// ─── SEO & Redirects Mock Data ───────────────────────────────────────────────

export interface SeoRedirectItem {
  id: string;
  fromPath: string;
  toPath: string;
  type: "301" | "302";
  hitCount: number;
  status: "active" | "inactive";
  note: string;
  createdAt: string;
}

export const MOCK_SEO_REDIRECTS: SeoRedirectItem[] = [
  {
    id: "seo-1",
    fromPath: "/products/drone-4k",
    toPath: "/products/eachine-ex5-4k-gps-fpv-drone",
    type: "301",
    hitCount: 1420,
    status: "active",
    note: "Legacy URL alias from old product campaign",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: "seo-2",
    fromPath: "/deals/flash",
    toPath: "/categories/rc-drones-toys",
    type: "302",
    hitCount: 890,
    status: "active",
    note: "Temporary banner campaign redirect",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "seo-3",
    fromPath: "/tools/laser",
    toPath: "/categories/tools-diy-hardware",
    type: "301",
    hitCount: 450,
    status: "active",
    note: "Shortened URL for laser engraver category",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

// ─── Broadcast Notifications Mock Data ───────────────────────────────────────

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  targetAudience: "all_users" | "vip_customers" | "staff_only";
  type: "announcement" | "price_drop" | "security_alert" | "system_maintenance";
  sentCount: number;
  openRate: string;
  status: "sent" | "scheduled" | "draft";
  sentAt: string;
}

export const MOCK_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: "notif-1",
    title: "⚡ Flash Sourcing Drop: Eachine 4K Drones Restocked in Shenzhen",
    message: "Limited batch of 50 units with dual batteries ready for priority air cargo dispatch.",
    targetAudience: "all_users",
    type: "announcement",
    sentCount: 1420,
    openRate: "48.2%",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "notif-2",
    title: "Binance Pay USDT Gateway 0-Fee Promotion Active",
    message: "Pay with Binance Pay on checkout to receive an instant $5 USDT discount voucher.",
    targetAudience: "all_users",
    type: "price_drop",
    sentCount: 2890,
    openRate: "62.4%",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

// ─── Integrations & Third-Party APIs Mock Data ───────────────────────────────

export interface IntegrationService {
  id: string;
  name: string;
  category: "Payment Gateway" | "Database & Auth" | "Logistics & Tracking" | "Communications" | "Security";
  iconName: string;
  status: "healthy" | "degraded" | "configured" | "pending_keys";
  lastCheck: string;
  responseTimeMs: number;
  authMethod: "API Key + HMAC SHA512" | "Supabase Service Role" | "Bearer OAuth2" | "Webhook Secret";
  endpoint: string;
  details: string;
}

export const MOCK_INTEGRATIONS: IntegrationService[] = [
  {
    id: "int-1",
    name: "Binance Pay Merchant API v3",
    category: "Payment Gateway",
    iconName: "Coins",
    status: "healthy",
    lastCheck: "1 min ago",
    responseTimeMs: 84,
    authMethod: "API Key + HMAC SHA512",
    endpoint: "https://bpay.binanceapi.com/binancepay/openapi/v3/order",
    details: "Zero gas fee USDT escrow checkout. Webhook signature verification verified.",
  },
  {
    id: "int-2",
    name: "Supabase PostgreSQL Database & Auth",
    category: "Database & Auth",
    iconName: "Cpu",
    status: "healthy",
    lastCheck: "2 mins ago",
    responseTimeMs: 32,
    authMethod: "Supabase Service Role",
    endpoint: "https://xxx.supabase.co/rest/v1",
    details: "Row Level Security (RLS) active. Connection pooling via pgBouncer.",
  },
  {
    id: "int-3",
    name: "YunExpress Global Air Logistics API",
    category: "Logistics & Tracking",
    iconName: "Truck",
    status: "healthy",
    lastCheck: "5 mins ago",
    responseTimeMs: 140,
    authMethod: "API Key + HMAC SHA512",
    endpoint: "https://api.yunexpress.com/LMS.API/api/WayBill/Create",
    details: "Automated air cargo manifest generation & Shenzhen hub pickup scheduling.",
  },
  {
    id: "int-4",
    name: "Yanwen Air Express Special Line API",
    category: "Logistics & Tracking",
    iconName: "Plane",
    status: "healthy",
    lastCheck: "12 mins ago",
    responseTimeMs: 165,
    authMethod: "API Key + HMAC SHA512",
    endpoint: "https://api.yanwen.com.cn/v1/shipments",
    details: "Priority European & UK DDP shipping line dispatch.",
  },
  {
    id: "int-5",
    name: "Cloudflare Turnstile Bot Defense",
    category: "Security",
    iconName: "ShieldCheck",
    status: "healthy",
    lastCheck: "3 mins ago",
    responseTimeMs: 22,
    authMethod: "Bearer OAuth2",
    endpoint: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    details: "Zero-friction captcha protection on checkout and registration endpoints.",
  },
];

// ─── Store Settings Mock Data ────────────────────────────────────────────────

export interface StoreSettingsData {
  storeName: string;
  storeTagline: string;
  supportEmail: string;
  supportPhone: string;
  guangzhouHubAddress: string;
  shenzhenHubAddress: string;
  defaultCurrency: string;
  usdtFixedRateUSD: number;
  freeAirShippingThreshold: number;
  standardAirShippingCost: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  minOrderAmountUSDT: number;
  maxOrderAmountUSDT: number;
  orderPrefix: string;
}

export const MOCK_STORE_SETTINGS: StoreSettingsData = {
  storeName: "Lennox China Mall",
  storeTagline: "Direct-from-Factory China Hardware & Drone Sourcing in USDT",
  supportEmail: "support@lennoxchinamall.com",
  supportPhone: "+86 755 8899 0011",
  guangzhouHubAddress: "Building 4, Baiyun International Logistics Park, Guangzhou, GD 510440",
  shenzhenHubAddress: "Floor 8, High-Tech Industrial Park, Nanshan, Shenzhen, GD 518057",
  defaultCurrency: "USDT",
  usdtFixedRateUSD: 1.00,
  freeAirShippingThreshold: 75.00,
  standardAirShippingCost: 8.50,
  maintenanceMode: false,
  allowGuestCheckout: false,
  minOrderAmountUSDT: 10.00,
  maxOrderAmountUSDT: 50000.00,
  orderPrefix: "LCM",
};

// ─── Security & System Health Mock Data ──────────────────────────────────────

export interface SystemHealthMetrics {
  serverUptime: string;
  cpuUsagePct: number;
  memoryUsagePct: number;
  dbPoolConnections: number;
  activeAdminSessions: number;
  sslCertificateStatus: "valid" | "expiring_soon" | "invalid";
  sslExpiryDays: number;
  rlsPoliciesEnforcedCount: number;
  rateLimitBlockedRequestsLast24h: number;
  lastSecurityAuditDate: string;
}

export const MOCK_SYSTEM_HEALTH: SystemHealthMetrics = {
  serverUptime: "99.98% (42 days, 14 hours)",
  cpuUsagePct: 18.4,
  memoryUsagePct: 42.1,
  dbPoolConnections: 12,
  activeAdminSessions: 3,
  sslCertificateStatus: "valid",
  sslExpiryDays: 248,
  rlsPoliciesEnforcedCount: 28,
  rateLimitBlockedRequestsLast24h: 142,
  lastSecurityAuditDate: "Aug 24, 2026 12:00:00 GMT+8",
};


