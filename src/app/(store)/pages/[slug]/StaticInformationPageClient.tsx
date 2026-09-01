"use client";

import React from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { notFound } from "next/navigation";

interface StaticInformationPageClientProps {
  slug: string;
}

export function StaticInformationPageClient({ slug }: StaticInformationPageClientProps) {
  const { isSpanish } = useTranslation();

  const FAQ_ITEMS_EN = [
    {
      question: "How do I pay with USDT on Lennox ChinaMall?",
      answer: "During checkout, select Binance Pay. A unique QR code and merchant trade reference are generated. Open your Binance mobile app, scan the QR code, and confirm. Your order status updates to 'Paid' within 3 seconds with zero blockchain gas fees.",
    },
    {
      question: "What if my product arrives defective?",
      answer: "We offer a 30-day factory replacement guarantee. Simply submit a return ticket with photos or video proof from your account portal, and we will issue a full USDT refund or ship an expedited replacement.",
    },
    {
      question: "How does the single-vendor direct sourcing model work?",
      answer: "Lennox ChinaMall is not an open marketplace with uncontrolled resellers. When you order, our automated procurement system purchases the hardware directly from certified China manufacturing clusters in Shenzhen and Ningbo, performs bench testing, and ships door-to-door via tracked air cargo.",
    },
    {
      question: "What are the shipping times and delivery carriers?",
      answer: "Standard Direct Air Freight takes 7 to 12 business days and is FREE on orders over $50 USDT. International Priority (DHL / FedEx) takes 3 to 5 business days.",
    },
  ];

  const FAQ_ITEMS_ES = [
    {
      question: "¿Cómo pago con USDT en Lennox ChinaMall?",
      answer: "Durante el pago, selecciona Binance Pay. Se generará un código QR único y una referencia de comercio. Abre tu aplicación móvil de Binance, escanea el código QR y confirma. El estado de tu pedido se actualizará a 'Pagado' en 3 segundos sin tarifas de gas en la blockchain.",
    },
    {
      question: "¿Qué sucede si mi producto llega defectuoso?",
      answer: "Ofrecemos una garantía de reemplazo de fábrica de 30 días. Simplemente envía un ticket de devolución con fotos o video desde tu portal de cuenta y emitiremos un reembolso completo en USDT o enviaremos un reemplazo express.",
    },
    {
      question: "¿Cómo funciona el modelo de abastecimiento directo de proveedor único?",
      answer: "Lennox ChinaMall no es un mercado abierto con revendedores no controlados. Cuando realizas un pedido, nuestro sistema automatizado adquiere el hardware directamente de clústeres certificados en Shenzhen y Ningbo, realiza pruebas de control de calidad y lo envía puerta a puerta por carga aérea rastreada.",
    },
    {
      question: "¿Cuáles son los tiempos de envío y los transportistas de entrega?",
      answer: "La Carga Aérea Directa Estándar demora entre 7 y 12 días hábiles y es GRATIS en pedidos superiores a $50 USDT. La Prioridad Internacional (DHL / FedEx) demora entre 3 y 5 días hábiles.",
    },
  ];

  const FAQ_ITEMS = isSpanish ? FAQ_ITEMS_ES : FAQ_ITEMS_EN;

  const PAGES_DATA_EN: Record<
    string,
    {
      title: string;
      subtitle: string;
      body: React.ReactNode;
    }
  > = {
    about: {
      title: "Direct Factory Sourcing — How Lennox ChinaMall Works",
      subtitle: "Connecting buyers directly with certified manufacturing lines across Shenzhen, Guangzhou, and Ningbo.",
      body: (
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Lennox ChinaMall</strong> is a custom single-vendor commerce portal founded to eliminate excessive distributor markups. Unlike multi-vendor marketplaces where hundreds of third-party resellers inflate prices, Lennox operates on an automated buy-after-sale model.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">1. You Order in USDT</h3>
              <p className="text-xs text-slate-500">
                Checkout with zero crypto conversion delays using Binance Pay QR.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">2. Direct Procurement</h3>
              <p className="text-xs text-slate-500">
                We purchase the hardware straight from the supplier via internal routing codes.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">3. Inspected & Shipped</h3>
              <p className="text-xs text-slate-500">
                Tested for quality, packaged securely, and shipped with door-to-door tracking.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    "shipping-policy": {
      title: "Worldwide Shipping & Delivery Timelines",
      subtitle: "Fast air freight from China sorting facilities to North America, Europe, UAE, and worldwide.",
      body: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            All orders placed on Lennox ChinaMall are dispatched from our primary hub in Guangdong / Shenzhen.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-600">
            <li><strong>Standard Direct Air Freight:</strong> 7 - 12 business days (FREE on orders over $50 USDT).</li>
            <li><strong>International Priority (DHL / FedEx):</strong> 3 - 5 business days ($14.99 USDT).</li>
            <li><strong>Processing & Procurement Time:</strong> 24 - 48 hours for factory pickup and bench testing.</li>
            <li><strong>Customs & Import Fees:</strong> Handled seamlessly via DDP (Delivered Duty Paid) protocols.</li>
          </ul>
        </div>
      ),
    },
    faq: {
      title: "Frequently Asked Questions & USDT Sourcing Guide",
      subtitle: "Learn more about paying with cryptocurrency and order delivery.",
      body: (
        <div className="space-y-6 text-sm text-slate-700">
          {FAQ_ITEMS_EN.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1.5">{faq.question}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      ),
    },
  };

  const PAGES_DATA_ES: Record<
    string,
    {
      title: string;
      subtitle: string;
      body: React.ReactNode;
    }
  > = {
    about: {
      title: "Abastecimiento Directo de Fábrica — Cómo Funciona Lennox ChinaMall",
      subtitle: "Conectando compradores directamente con líneas de fabricación certificadas en Shenzhen, Guangzhou y Ningbo.",
      body: (
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Lennox ChinaMall</strong> es un portal comercial de proveedor único fundado para eliminar los sobreprecios de distribuidores intermediarios. A diferencia de plataformas abiertas donde terceros inflan los precios, Lennox opera bajo un modelo automatizado de compra directa tras la venta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">1. Ordenas en USDT</h3>
              <p className="text-xs text-slate-500">
                Paga con cero comisiones de conversión cripto usando el QR de Binance Pay.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">2. Adquisición Directa</h3>
              <p className="text-xs text-slate-500">
                Compramos el hardware directamente de la fábrica mediante códigos de enrutamiento interno.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">3. Inspección y Envío</h3>
              <p className="text-xs text-slate-500">
                Probado para calidad, empaquetado de forma segura y despachado con rastreo puerta a puerta.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    "shipping-policy": {
      title: "Envíos Internacionales y Tiempos de Entrega",
      subtitle: "Transporte aéreo rápido desde centros de clasificación en China hacia América, Europa y el mundo.",
      body: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Todos los pedidos realizados en Lennox ChinaMall se despachan desde nuestro centro principal en Guangdong / Shenzhen.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-600">
            <li><strong>Carga Aérea Directa Estándar:</strong> 7 - 12 días hábiles (GRATIS en pedidos superiores a $50 USDT).</li>
            <li><strong>Prioridad Internacional (DHL / FedEx):</strong> 3 - 5 días hábiles ($14.99 USDT).</li>
            <li><strong>Tiempo de Procesamiento y Adquisición:</strong> 24 - 48 horas para recogida en fábrica e inspección técnica.</li>
            <li><strong>Aduanas y Aranceles de Importación:</strong> Gestionados sin problemas mediante protocolos DDP (Entregado con Derechos Pagados).</li>
          </ul>
        </div>
      ),
    },
    faq: {
      title: "Preguntas Frecuentes y Guía de Abastecimiento USDT",
      subtitle: "Conoce más sobre cómo pagar con criptomonedas y la entrega de pedidos.",
      body: (
        <div className="space-y-6 text-sm text-slate-700">
          {FAQ_ITEMS_ES.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1.5">{faq.question}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      ),
    },
  };

  const pagesData = isSpanish ? PAGES_DATA_ES : PAGES_DATA_EN;
  const current = pagesData[slug];

  if (!current) {
    notFound();
  }

  const breadcrumbItems = [{ label: current.title, href: `/pages/${slug}` }];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {slug === "faq" && <FaqJsonLd questions={FAQ_ITEMS} />}

      <Breadcrumbs items={[{ label: current.title }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500">{current.subtitle}</p>
        </div>

        <div>{current.body}</div>
      </div>
    </div>
  );
}
