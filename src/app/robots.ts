import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products/", "/categories/", "/pages/"],
        disallow: [
          "/admin/",
          "/admin",
          "/account/",
          "/account",
          "/api/",
          "/auth/",
          "/cart",
          "/checkout",
          "/search",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/"],
        disallow: ["/admin/", "/account/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
