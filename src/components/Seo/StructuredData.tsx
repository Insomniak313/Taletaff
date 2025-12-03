import { jobCategories } from "@/config/jobCategories";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";

const breadcrumbBase = [
  {
    "@type": "ListItem",
    position: 1,
    name: "Accueil",
    item: absoluteUrl("/"),
  },
  {
    "@type": "ListItem",
    position: 2,
    name: "Offres d'emploi",
    item: absoluteUrl("/jobs"),
  },
] as const;

const jobCategoryItems = jobCategories.map((category, index) => ({
  "@type": "ListItem",
  position: index + breadcrumbBase.length + 1,
  name: category.title,
  item: absoluteUrl(`/jobs/${category.slug}`),
}));

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteMetadata.organization.name,
  legalName: siteMetadata.organization.legalName,
  url: siteMetadata.siteUrl,
  logo: siteMetadata.organization.logo,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: siteMetadata.contactEmail,
      contactType: "customer support",
      availableLanguage: ["fr", "en"],
    },
  ],
  sameAs: siteMetadata.organization.sameAs,
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteMetadata.title,
  url: siteMetadata.siteUrl,
  inLanguage: siteMetadata.locale,
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/jobs")}?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [...breadcrumbBase, ...jobCategoryItems],
};

const structuredDataPayload = [organizationSchema, breadcrumbSchema, webSiteSchema];

export const StructuredData = () => (
  <script
    type="application/ld+json"
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataPayload) }}
  />
);
