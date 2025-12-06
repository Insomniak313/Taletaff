import { NextResponse } from "next/server";
import { jobService } from "@/services/jobService";
import { isJobProviderId } from "@/config/jobProviders";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const dynamic = "force-dynamic";

const clampPage = (value: string | null) => {
  if (!value) {
    return 1;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
};

const clampPageSize = (value: string | null) => {
  if (!value) {
    return DEFAULT_PAGE_SIZE;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_PAGE_SIZE);
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
  const pageSize = clampPageSize(searchParams.get("pageSize") ?? searchParams.get("limit"));
  const requestedPage = clampPage(searchParams.get("page"));
  const offset = (requestedPage - 1) * pageSize;

  const tags = tagsParam
    ? tagsParam
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : undefined;

  try {
    let result = await jobService.searchJobs({
      category,
      provider,
      query,
      location,
      remoteOnly,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      tags,
      limit: pageSize,
      offset,
    });
    const pageCount = Math.max(Math.ceil(result.totalCount / pageSize), 1);
    const safePage = Math.min(requestedPage, pageCount);

    if (safePage !== requestedPage) {
      result = await jobService.searchJobs({
        category,
        provider,
        query,
        location,
        remoteOnly,
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        tags,
        limit: pageSize,
        offset: (safePage - 1) * pageSize,
      });
    }

    return NextResponse.json({
      jobs: result.jobs,
      summary: result.summary,
      pagination: {
        page: safePage,
        pageSize,
        totalCount: result.totalCount,
        pageCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
