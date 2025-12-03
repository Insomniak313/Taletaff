import { NextResponse } from "next/server";
import { jobService } from "@/services/jobService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const query = searchParams.get("query") ?? undefined;

  try {
    const jobs = await jobService.searchJobs({ category, query, limit: 20 });
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
