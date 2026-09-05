import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getPublicStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Lennox ChinaMall | Direct China Sourcing & USDT Checkout",
  description:
    "Factory-direct China shopping portal with automated USDT cryptocurrency payments. Sourced and inspected by Lennox.",
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicSettings = await getPublicStoreSettings();
  const brandLogo = publicSettings?.branding?.primary_logo_url;
  const storeName = publicSettings?.store_info?.store_name;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header logoUrl={brandLogo} storeName={storeName} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <Footer logoUrl={brandLogo} storeName={storeName} />
      <MobileNav />
      <CartDrawer />
    </div>
  );
}
