import type { JobProvider } from "@/features/jobs/providers/types";
import { frJobProviders } from "@/features/jobs/providers/frProviders";

const JOB_PROVIDERS: JobProvider[] = frJobProviders;

export { JOB_PROVIDERS };
export type {
  JobProvider,
  JobProviderId,
  JobProviderSettings,
  ProviderJob,
} from "@/features/jobs/providers/types";
