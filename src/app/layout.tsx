import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00143D",
};

export const metadata: Metadata = {
  title: {
    default: "Lennox ChinaMall — Direct China Sourcing & Wholesale Portal",
    template: "%s | Lennox ChinaMall",
  },
  description:
    "Leading China direct-to-consumer e-commerce portal. Buy electronics, 4K drones, 3D printers, tools and hardware at factory prices with Binance Pay USDT settlement.",
  icons: {
    icon: "/logo-lennoxchinamall.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="font-montserrat antialiased min-h-full bg-[#F5F7FA] text-[#333333] selection:bg-[#FF1028] selection:text-white">
        {children}
      </body>
    </html>
  );
}
