import type { JobProvider } from "@/features/jobs/providers/types";
import { createWebhookProvider } from "@/features/jobs/providers/providerFactory";
import { providerCatalog } from "@/features/jobs/providers/providerCatalog";

const webhookProviders: JobProvider[] = providerCatalog
  .filter((entry) => entry.kind === "webhook")
  .map((entry) =>
    createWebhookProvider({
      id: entry.id,
      label: entry.label,
      defaultCategory: entry.defaultCategory,
      language: entry.language,
    })
  );

export { webhookProviders };
