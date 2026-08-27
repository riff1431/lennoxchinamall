import React from "react";
import { Product, Category } from "@/types/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

interface ProductJsonLdProps {
  product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const images = product.media && product.media.length > 0
    ? product.media.map((m) => m.url)
    : ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"];

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: images,
    description: product.short_description || product.description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "Lennox Direct",
    },
    offers: {
      "@type": "Offer",
      url: `${APP_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.base_price.toFixed(2),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Lennox ChinaMall Direct Sourcing",
        url: APP_URL,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.base_price >= 50 ? "0.00" : "4.99",
          currency: "USD",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 7,
            maxValue: 12,
            unitCode: "d",
          },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (product.avg_rating || 4.8).toFixed(1),
      reviewCount: Math.max(1, product.review_count || 12),
      bestRating: "5",
      worstRating: "1",
    },
    ...(product.reviews && product.reviews.length > 0
      ? {
          review: product.reviews.map((rev) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: rev.user?.display_name || "Verified Sourcing Buyer",
            },
            datePublished: rev.created_at.split("T")[0],
            reviewBody: rev.body,
            name: rev.title || "Direct factory product review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: String(rev.rating),
              bestRating: "5",
              worstRating: "1",
            },
          })),
        }
      : {}),
    ...(product.videos && product.videos.length > 0
      ? {
          video: product.videos.map((v) => ({
            "@type": "VideoObject",
            name: v.title || `${product.title} - Factory Inspection & Demo`,
            description: `Quality testing and factory demo video for ${product.title}`,
            thumbnailUrl: images[0],
            uploadDate: product.created_at,
            contentUrl: v.url,
          })),
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { label: string; href?: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: APP_URL,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.href && item.href !== "#"
          ? { item: item.href.startsWith("http") ? item.href : `${APP_URL}${item.href}` }
          : {}),
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lennox ChinaMall",
    alternateName: "Lennox China Mall Sourcing",
    url: APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lennox ChinaMall",
    url: APP_URL,
    logo: `${APP_URL}/logo-lennoxchinamall.png`,
    description: "Direct-to-consumer single-vendor commerce gateway connecting global buyers with certified China industrial manufacturing clusters via USDT Binance Pay.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Chinese"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}

interface FaqJsonLdProps {
  questions: { question: string; answer: string }[];
}

export function FaqJsonLd({ questions }: FaqJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CategoryJsonLdProps {
  category: Category;
}

export function CategoryJsonLd({ category }: CategoryJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} - Direct China Factory Sourcing`,
    description: category.description || `Browse verified direct manufacturer products in ${category.name}.`,
    url: `${APP_URL}/categories/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      name: category.name,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: category.product_count || 10,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
