import { NextResponse } from "next/server";
import { jobScheduler } from "@/features/jobs/scheduler/jobScheduler";
import { requireRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/requireRole";

const handleError = (error: unknown) => {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  const message = error instanceof Error ? error.message : "Erreur serveur";
  return NextResponse.json({ error: message }, { status: 500 });
};

export async function POST(request: Request) {
  try {
    await requireRole(request, ["admin"]);
    const summary = await jobScheduler.runAllProviders();
    return NextResponse.json(summary);
  } catch (error) {
    return handleError(error);
  }
}
