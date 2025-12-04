import { NextResponse } from "next/server";
import { jobService } from "@/services/jobService";
import { isJobProviderId } from "@/config/jobProviders";

const DEFAULT_JOB_SEARCH_LIMIT = 400;
const MAX_JOB_SEARCH_LIMIT = 1000;

export const dynamic = "force-dynamic";

const clampLimit = (value: string | null) => {
  if (!value) {
    return DEFAULT_JOB_SEARCH_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_JOB_SEARCH_LIMIT;
  }

  return Math.min(parsed, MAX_JOB_SEARCH_LIMIT);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const providerParam = searchParams.get("provider");
  const provider = providerParam && isJobProviderId(providerParam) ? providerParam : undefined;
  const query = searchParams.get("query") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const remoteOnly = searchParams.get("remote") === "true";
  const minSalary = searchParams.get("minSalary");
  const maxSalary = searchParams.get("maxSalary");
  const tagsParam = searchParams.get("tags");
  const limit = clampLimit(searchParams.get("limit"));

  const tags = tagsParam
    ? tagsParam
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : undefined;

  try {
    const result = await jobService.searchJobs({
      category,
      provider,
      query,
      location,
      remoteOnly,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      tags,
      limit,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
