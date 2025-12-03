import { NextResponse } from "next/server";
import { jobScheduler } from "@/features/jobs/scheduler/jobScheduler";

export const runtime = "nodejs";

const isAuthorized = (request: Request): boolean => {
  const secret = process.env.JOB_CRON_SECRET;
  if (!secret) {
    return true;
  }
  return request.headers.get("x-cron-secret") === secret;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const summary = await jobScheduler.syncDueProviders();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur scheduler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
