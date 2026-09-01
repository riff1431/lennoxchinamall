export const PRODUCT_SPANISH_TITLES: Record<string, string> = {
  "eachine-ex5-4k-gps-fpv-drone": "Drone RC Eachine EX5 4K GPS 5G WiFi FPV sin Escobillas con 30min de Vuelo",
  "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker": "Altavoz Bluetooth Portátil BlitzWolf BW-WA3 Pro 120W Tri-Driver IPX5",
  "creality-ender-3-v3-se-3d-printer": "Impresora 3D Creality Ender-3 V3 SE con Nivelación Automática CR Touch",
  "astrolux-ft03s-9300lm-tactical-flashlight": "Linterna Táctica Astrolux FT03S SFH55 9300 Lúmenes de Largo Alcance",
  "topshak-ts-esd4-20v-brushless-impact-wrench": "Llave de Impacto Inalámbrica sin Escobillas Topshak TS-ESD4 20V 350N.m",
  "konnwei-kw850-obd2-car-diagnostic-scanner": "Escáner de Diagnóstico Automotriz OBD2 KONNWEI KW850 Multilingüe",
  "ts101-smart-usbc-soldering-iron": "Cautín Inteligente USB-C TS101 65W/45W con Pantalla OLED",
  "creality-k1-max-high-speed-3d-printer": "Impresora 3D de Alta Velocidad Creality K1 Max 600mm/s con LiDAR IA",
};

export function getLocalizedProductTitle(slug: string | undefined | null, originalTitle: string, isSpanish: boolean): string {
  if (!originalTitle) return "";
  if (!isSpanish) return originalTitle;
  if (slug && PRODUCT_SPANISH_TITLES[slug]) {
    return PRODUCT_SPANISH_TITLES[slug];
  }
  return originalTitle;
}
