import type { JobProvider } from "@/features/jobs/providers/types";
import { frJobProviders } from "@/features/jobs/providers/frProviders";
import { webhookProviders } from "@/features/jobs/providers/webhookProviders";

const JOB_PROVIDERS: JobProvider[] = [...frJobProviders, ...webhookProviders];

export { JOB_PROVIDERS };
export type {
  JobProvider,
  JobProviderId,
  JobProviderLanguage,
  JobProviderSettings,
  ProviderJob,
} from "@/features/jobs/providers/types";
