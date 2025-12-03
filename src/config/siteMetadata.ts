import { clientEnv } from "@/lib/env.client";

const baseUrl = new URL(clientEnv.siteUrl);
const normalizedSiteUrl = `${baseUrl.origin}${baseUrl.pathname}`.replace(/\/$/, "");

const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const staticRoutes = ["/", "/jobs", "/login", "/signup", "/forgot-password"] as const;
const restrictedRoutes = [
  "/api",
  "/dashboard",
  "/dashboard/admin",
  "/dashboard/candidat",
  "/dashboard/employeur",
  "/dashboard/moderation",
] as const;

const defaultKeywords = [
  "emploi restauration",
  "emploi agriculture",
  "emploi tech",
  "industrie",
  "logistique",
  "services essentiels",
  "product management",
  "marketing digital",
  "operations",
  "remote",
  "talent acquisition",
] as const;

export const absoluteUrl = (path = "/") => {
  const normalizedPath = ensureLeadingSlash(path);
  if (normalizedPath === "/") {
    return `${normalizedSiteUrl}/`;
  }
  return `${normalizedSiteUrl}${normalizedPath}`;
};

export const siteMetadata = {
  title: "Taletaff · Trouvez un emploi qui a du sens",
  description:
    "Plateforme Next.js propulsée par Supabase pour sourcer les meilleures offres restauration, agriculture, industrie ou tech avec un accompagnement humain.",
  siteUrl: normalizedSiteUrl,
  defaultImage: "/window.svg",
  twitterHandle: "@taletaff",
  keywords: defaultKeywords,
  locale: "fr_FR",
  contactEmail: "bonjour@taletaff.com",
  socials: {
    twitter: "https://twitter.com/taletaff",
    linkedin: "https://www.linkedin.com/company/taletaff",
  },
  organization: {
    name: "Taletaff",
    legalName: "Taletaff",
    url: normalizedSiteUrl,
    logo: absoluteUrl("/window.svg"),
    sameAs: [
      "https://twitter.com/taletaff",
      "https://www.linkedin.com/company/taletaff",
    ],
  },
  sitemap: {
    staticRoutes,
    restrictedRoutes,
    changeFrequency: "weekly" as const,
  },
};
