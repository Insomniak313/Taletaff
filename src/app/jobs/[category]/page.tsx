import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobCategories, jobCategoryMap } from "@/config/jobCategories";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

interface Props {
  params: { category: string };
}

export const generateStaticParams = () =>
  jobCategories.map((category) => ({ category: category.slug }));

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const category = jobCategoryMap[params.category];

  if (!category) {
    return { title: "Catégorie introuvable · Taletaff" };
  }

  const canonicalUrl = absoluteUrl(`/jobs/${params.category}`);
  const ogImageUrl = absoluteUrl(siteMetadata.defaultImage);

  return {
    title: category.seo.title,
    description: category.seo.description,
    keywords: category.seo.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: category.seo.title,
      description: category.seo.description,
      url: canonicalUrl,
      siteName: siteMetadata.organization.name,
      locale: siteMetadata.locale,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: category.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteMetadata.twitterHandle,
      images: [ogImageUrl],
    },
  };
};

const CategoryPage = ({ params }: Props) => {
  const category = jobCategoryMap[params.category];

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          {category.title}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">{category.hero}</h1>
        <p className="text-base text-slate-600">{category.description}</p>
      </header>
      <JobSearchSection initialCategory={category.slug} />
    </div>
  );
};

export default CategoryPage;
