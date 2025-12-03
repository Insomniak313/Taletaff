import type { JobCategory } from "@/types/job";

export const jobCategories: JobCategory[] = [
  {
    slug: "product",
    title: "Produit",
    description:
      "Concevez des expériences utilisateur puissantes en pilotant la stratégie produit et la feuille de route grâce à des données actionnables.",
    hero: "Architectes de solutions centrées utilisateur",
    seo: {
      title: "Offres d'emploi Produit · Taletaff",
      description:
        "Product Managers, UX Researchers, Product Designers : explorez plus de 1200 offres produit filtrées par seniorité, localisation et remote.",
      keywords: ["product manager", "ux", "design", "research"]
    }
  },
  {
    slug: "engineering",
    title: "Ingénierie",
    description:
      "Rejoignez des équipes tech exigeantes et contribuez à des plateformes critiques en TypeScript, Go, Rust ou Python.",
    hero: "Construisez des systèmes scalables",
    seo: {
      title: "Jobs Développeurs & Data · Taletaff",
      description:
        "Développeurs fullstack, spécialistes data et SRE : offres vérifiées avec salaires transparents et options remote-first.",
      keywords: ["developpeur", "fullstack", "data", "sre"]
    }
  },
  {
    slug: "marketing",
    title: "Marketing & Growth",
    description:
      "Accélérez la croissance avec des campagnes data-driven, un pilotage précis des budgets et des boucles d'optimisation rapides.",
    hero: "Déployez des stratégies multi-canal",
    seo: {
      title: "Marketing, Growth & Brand · Taletaff",
      description:
        "Growth marketers, CRM specialists, brand managers : accédez aux offres les plus qualitatives en Europe.",
      keywords: ["growth", "brand", "crm", "seo"]
    }
  },
  {
    slug: "operations",
    title: "Operations",
    description:
      "Structurez l'entreprise, façonnez des playbooks robustes et automatisez les tâches répétitives pour gagner en efficacité.",
    hero: "Optimisez chaque flux métier",
    seo: {
      title: "Operations & Chief of Staff · Taletaff",
      description:
        "Chief of staff, bizops, revenue operations : missions à haute responsabilité avec sponsors exécutifs engagés.",
      keywords: ["ops", "chief of staff", "revenue", "process"]
    }
  }
];

export const jobCategoryMap = jobCategories.reduce<Record<string, JobCategory>>(
  (acc, category) => {
    acc[category.slug] = category;
    return acc;
  },
  {}
);

export const defaultJobCategory = jobCategories[0];
