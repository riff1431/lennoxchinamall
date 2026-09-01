export const CATEGORY_SPANISH_TRANSLATIONS: Record<string, string> = {
  // Main Categories
  "4K Drones & FPV": "Drones 4K y FPV",
  "4K Aerial Drones & FPV": "Drones Aéreos 4K y FPV",
  "3D Printers & Laser CNC": "Impresoras 3D y CNC Láser",
  "3D Printers & CNC": "Impresoras 3D y CNC",
  "Pro Audio & Boomboxes": "Audio Profesional y Altavoces",
  "High-Fidelity Audio": "Audio de Alta Fidelidad",
  "Men's Fashion": "Moda Masculina",
  "Women's Fashion": "Moda Femenina",
  "Kid's Fashion": "Moda Infantil",
  "Health & Beauty": "Salud y Belleza",
  "Pet Supplies": "Artículos para Mascotas",
  "Home & Kitchen": "Hogar y Cocina",
  "Industrial & Science": "Industrial y Científico",
  "Automotive & Tools": "Automotriz y Herramientas",
  "Car OBD2 & Diagnostic": "OBD2 y Diagnóstico Automotriz",
  "Tactical & Outdoor Gear": "Equipo Táctico y Exterior",
  "Sports & Outdoors": "Deportes y Aire Libre",
  "Smart Home & Robotics": "Hogar Inteligente y Robótica",
  "Smart Robotics & IoT": "Robótica Inteligente e IoT",
  "Thermal & Laser Optics": "Óptica Térmica y Láser",
  "Smart Wearables & AR": "Wearables Inteligentes y RA",
  "Portable Power & Solar": "Energía Portátil y Solar",
  "Pro Camera & Rigging": "Cámaras Profesionales y Soportes",
  "Consumer Electronics": "Electrónica de Consumo",
  "RC Drones & Toys": "Drones RC y Juguetes",
  "Tools & DIY Hardware": "Herramientas y Bricolaje",
  "Smart Home & Living": "Hogar Inteligente y Vida",
  "Flash Deals & Daily Drops": "Ofertas Flash y Descuentos Diarios",
  "New Factory Arrivals": "Novedades Directas de Fábrica",

  // Subcategories
  "4K GPS Drones": "Drones GPS 4K",
  "FPV Racers": "Drones de Carreras FPV",
  "Goggles & Radios": "Gafas y Radios",
  "LiPo Batteries & Propellers": "Baterías LiPo y Hélices",
  "FDM 3D Printers": "Impresoras 3D FDM",
  "Resin 3D Printers": "Impresoras 3D de Resina",
  "Laser Engravers": "Grabadores Láser",
  "PLA & PETG Filaments": "Filamentos PLA y PETG",
  "Bluetooth Boomboxes": "Altavoces Bluetooth Potentes",
  "Studio Monitors": "Monitores de Estudio",
  "Wireless Microphones": "Micrófonos Inalámbricos",
  "PA Sound Systems": "Sistemas de Sonido PA",
  "Jackets & Coats": "Chaquetas y Abrigos",
  "Streetwear Hoodies": "Sudaderas Urbanas",
  "Dresses & Skirts": "Vestidos y Faldas",
  "Handbags & Wallets": "Bolsos y Carteras",
  "Baby Rompers": "Mamelucos para Bebé",
  "Kids Shoes": "Calzado Infantil",
  "Skincare Serums": "Sérums Faciales",
  "Hair Styling Tools": "Herramientas de Peinado",
  "Dog Harnesses & Leashes": "Arneses y Correas para Perros",
  "Automatic Cat Feeders": "Comederos Automáticos para Gatos",
  "Air Fryers & Blenders": "Freidoras de Aire y Batidoras",
  "Kitchen Knife Sets": "Juegos de Cuchillos de Cocina",
};

export function getLocalizedCategoryName(name: string | undefined | null, isSpanish: boolean): string {
  if (!name) return "";
  if (!isSpanish) return name;
  return CATEGORY_SPANISH_TRANSLATIONS[name] || name;
}

export function getLocalizedSubcategory(sub: string, isSpanish: boolean): string {
  if (!sub) return "";
  if (!isSpanish) return sub;
  return CATEGORY_SPANISH_TRANSLATIONS[sub] || sub;
}
