import type { MetadataRoute } from "next";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteMetadata.siteUrl,
    sitemap: absoluteUrl("/sitemap.xml"),
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...siteMetadata.sitemap.restrictedRoutes],
      },
    ],
  };
}
