import { Category, Brand, Product, Order, Supplier } from "@/types/database";

export const MOCK_CATEGORIES: (Category & { iconName: string; subcategories?: string[] })[] = [
  {
    id: "cat-1",
    name: "Consumer Electronics",
    slug: "consumer-electronics",
    parent_id: null,
    description: "Factory-direct smart gadgets, audio, cameras, and accessories",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    icon: "Smartphone",
    iconName: "Smartphone",
    position: 1,
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
    icon: "Plane",
    iconName: "Plane",
    position: 2,
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
    icon: "Wrench",
    iconName: "Wrench",
    position: 3,
    is_active: true,
    seo_title: "Tools, 3D Printers & Industrial - Lennox ChinaMall",
    seo_description: "Professional maker tools, CNC machines, and soldering kits.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["3D Printers & Filaments", "Laser Engravers", "Soldering & Rework", "Multimeters & Oscilloscopes"],
    product_count: 85
  },
  {
    id: "cat-4",
    name: "Smart Home & Living",
    slug: "smart-home-living",
    parent_id: null,
    description: "Automated lifestyle gadgets, robot vacuums, and LED ambience",
    image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80",
    icon: "Home",
    iconName: "Home",
    position: 4,
    is_active: true,
    seo_title: "Smart Home & Automation - Lennox ChinaMall",
    seo_description: "Intelligent cleaning, home security, and ambient lighting.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["Robot Vacuums", "Smart Lighting", "Security & Cameras", "Air Purifiers"],
    product_count: 110
  },
  {
    id: "cat-5",
    name: "Automotive & E-Mobility",
    slug: "automotive-e-mobility",
    parent_id: null,
    description: "OBD2 diagnostic scanners, dash cams, and electric scooter accessories",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    icon: "Car",
    iconName: "Car",
    position: 5,
    is_active: true,
    seo_title: "Car Electronics & Diagnostic Tools - Lennox ChinaMall",
    seo_description: "Direct automotive tools, jump starters, and dashcams.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["OBD2 Scanners", "Dual Dash Cams", "Jump Starters", "Tire Inflators"],
    product_count: 64
  },
  {
    id: "cat-6",
    name: "Outdoor & Tactical",
    slug: "outdoor-tactical",
    parent_id: null,
    description: "High-lumen EDC flashlights, solar generators, and survival gear",
    image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80",
    icon: "Compass",
    iconName: "Compass",
    position: 6,
    is_active: true,
    seo_title: "Outdoor & EDC Tech - Lennox ChinaMall",
    seo_description: "High output tactical flashlights and portable solar stations.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: ["EDC Flashlights", "Solar Generators", "Camping Power", "Thermal Imaging"],
    product_count: 72
  }
];

export const MOCK_BRANDS: Brand[] = [
  { id: "brand-1", name: "Eachine Labs", slug: "eachine-labs", logo_url: null, description: "FPV & RC Tech", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-2", name: "BlitzWolf", slug: "blitzwolf", logo_url: null, description: "Audio & Power Accessories", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-3", name: "Creality 3D", slug: "creality-3d", logo_url: null, description: "Desktop 3D Printing", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-4", name: "Astrolux EDC", slug: "astrolux-edc", logo_url: null, description: "High Performance Flashlights", is_active: true, created_at: new Date().toISOString() },
  { id: "brand-5", name: "Topshak Tools", slug: "topshak-tools", logo_url: null, description: "Power Tools & Solder", is_active: true, created_at: new Date().toISOString() }
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
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "embed",
        position: 1,
        title: "Video 1: Drone Flight Test & Range Demo",
        created_at: new Date().toISOString()
      },
      {
        id: "v-2",
        product_id: "prod-1",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "embed",
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
      { id: "v-2-1", product_id: "prod-2", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 1, title: "Video 1: Bass Test & Decibel Measurement", created_at: new Date().toISOString() },
      { id: "v-2-2", product_id: "prod-2", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 2, title: "Video 2: IPX5 Water Splash Demonstration", created_at: new Date().toISOString() }
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
    is_flash_deal: false,
    flash_deal_ends_at: null,
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
      { id: "v-3-1", product_id: "prod-3", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 1, title: "Video 1: 20-Minute Quick Setup & Bed Leveling", created_at: new Date().toISOString() },
      { id: "v-3-2", product_id: "prod-3", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 2, title: "Video 2: High Speed 250mm/s Benchy Speedrun", created_at: new Date().toISOString() }
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
      { id: "v-4-1", product_id: "prod-4", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 1, title: "Video 1: 900-Meter Night Beam Distance Test", created_at: new Date().toISOString() },
      { id: "v-4-2", product_id: "prod-4", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 2, title: "Video 2: Anduril 2 UI Ramping & Strobe Guide", created_at: new Date().toISOString() }
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
      { id: "v-5-1", product_id: "prod-5", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 1, title: "Video 1: Lug Nut Removal & Torque Stress Test", created_at: new Date().toISOString() },
      { id: "v-5-2", product_id: "prod-5", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 2, title: "Video 2: Accessory Kit Overview & Socket Set", created_at: new Date().toISOString() }
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
      { id: "v-6-1", product_id: "prod-6", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 1, title: "Video 1: Check Engine Code Reading & Reset Demo", created_at: new Date().toISOString() },
      { id: "v-6-2", product_id: "prod-6", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "embed", position: 2, title: "Video 2: Live Sensor O2 & Battery Graphing", created_at: new Date().toISOString() }
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

export function getCachedProductBySlug(slug: string): Product | undefined {
  if (PRODUCT_SLUG_MAP.has(slug)) return PRODUCT_SLUG_MAP.get(slug);
  return MOCK_PRODUCTS.find((p) => p.slug.includes(slug) || slug.includes(p.slug));
}

export function getCachedProductById(id: string): Product | undefined {
  return PRODUCT_ID_MAP.get(id);
}

export function getCachedCategoryBySlug(slug: string) {
  return CATEGORY_SLUG_MAP.get(slug);
}

export function getCachedFlashDeals(limit = 6): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_flash_deal).slice(0, limit);
}

