import { NextResponse } from "next/server";
import { jobScheduler } from "@/features/jobs/scheduler/jobScheduler";
import type { JobProviderId } from "@/features/jobs/providers";
import type { SchedulerSummaryItem } from "@/features/jobs/scheduler/jobScheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_PROVIDER_ID: JobProviderId = "arbeitnow";

const formatSuccessPayload = (result: SchedulerSummaryItem) => ({
  provider: result.providerId,
  fetched: result.fetched ?? 0,
  persisted: result.persisted ?? 0,
  message:
    (result.persisted ?? 0) > 0
      ? "Offres synchronisées depuis notre provider public"
      : "Aucune nouvelle offre disponible",
});

const formatErrorPayload = (result: SchedulerSummaryItem) => ({
  provider: result.providerId,
  error: result.message ?? "Synchronisation impossible",
});

const triggerPublicSync = async () => {
  const result = await jobScheduler.runProvider(PUBLIC_PROVIDER_ID);
  if (result.status !== "success") {
    return NextResponse.json(formatErrorPayload(result), { status: 502 });
  }
  return NextResponse.json(formatSuccessPayload(result));
};

export async function POST() {
  try {
    return await triggerPublicSync();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
