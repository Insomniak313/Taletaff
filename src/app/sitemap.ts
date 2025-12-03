import type { MetadataRoute } from "next";
import { jobCategories } from "@/config/jobCategories";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();

  const marketingRoutes = siteMetadata.sitemap.staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    lastModified: generatedAt,
    changeFrequency: siteMetadata.sitemap.changeFrequency,
    priority: path === "/" ? 1 : 0.8,
  }));

  const categoryRoutes = jobCategories.map((category) => ({
    url: absoluteUrl(`/jobs/${category.slug}`),
    lastModified: generatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...marketingRoutes, ...categoryRoutes];
}
