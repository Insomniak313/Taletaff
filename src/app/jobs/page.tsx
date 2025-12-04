import type { Metadata } from "next";
import { jobCategoryMap } from "@/config/jobCategories";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

const operationsCategory = jobCategoryMap.operations;

const fallbackSeo = {
  title: "Offres d'emploi qualifiées · Taletaff",
  description: "Naviguez par catégorie, stack et localisation pour identifier l'offre parfaite.",
  keywords: ["job board", "emplois qualifiés", "recherche emploi"] as const,
};

const seo = operationsCategory?.seo ?? fallbackSeo;
const canonicalUrl = absoluteUrl("/jobs");
const ogImageUrl = absoluteUrl(siteMetadata.defaultImage);
const ogImageAlt = operationsCategory?.title ?? fallbackSeo.title;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: [...seo.keywords],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: canonicalUrl,
    siteName: siteMetadata.organization.name,
    locale: siteMetadata.locale,
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteMetadata.twitterHandle,
    images: [ogImageUrl],
  },
};

const JobsPage = () => (
  <div className="mx-auto w-full max-w-6xl px-4 py-16">
    <header className="mb-8 space-y-2">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        Offres vérifiées
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Recherche avancée par catégorie.
      </h1>
      <p className="text-base text-slate-600">
        Filtres interactifs, salaires transparents, matching intelligent.
      </p>
    </header>
    <JobSearchSection />
  </div>
);

export default JobsPage;
