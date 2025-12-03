import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JOB_PROVIDERS } from "@/features/jobs/providers";
import type { JobProviderId } from "@/features/jobs/providers";
import { providerConfigStore } from "@/features/jobs/providers/providerConfigStore";
import { fetchJobCounts, fetchRunRows } from "@/features/jobs/scheduler/jobScheduler";
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

const ensureProvider = (providerId: JobProviderId) => {
  const provider = JOB_PROVIDERS.find((entry) => entry.id === providerId);
  if (!provider) {
    throw new Error(`Provider ${providerId} introuvable`);
  }
  return provider;
};

export async function GET(request: Request) {
  try {
    await requireRole(request, ["admin"]);
    const client = supabaseAdmin();
    const [runs, jobCounts, settingsMap] = await Promise.all([
      fetchRunRows(client),
      fetchJobCounts(client, JOB_PROVIDERS.map((provider) => provider.id)),
      providerConfigStore.fetchSettingsMap(client),
    ]);

    const payload = JOB_PROVIDERS.map((provider) => {
      const run = runs[provider.id];
      const settings = settingsMap[provider.id];
      return {
        providerId: provider.id,
        label: provider.label,
        status: run?.status ?? "idle",
        lastRunAt: run?.last_run_at ?? null,
        lastSuccessAt: run?.last_success_at ?? null,
        error: run?.error ?? null,
        jobCount: jobCounts[provider.id] ?? 0,
        settings: {
          endpoint: settings?.endpoint,
          hasAuthToken: Boolean(settings?.authToken),
        },
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(request, ["admin"]);
    const body = await request.json();
    const providerId = body.providerId as JobProviderId | undefined;
    if (!providerId) {
      return NextResponse.json({ error: "providerId requis" }, { status: 400 });
    }
    ensureProvider(providerId);

    const patch = {
      endpoint: typeof body.endpoint === "string" ? body.endpoint.trim() || null : undefined,
      auth_token: typeof body.authToken === "string" ? body.authToken.trim() || null : undefined,
    };

    const client = supabaseAdmin();
    const updated = await providerConfigStore.upsertSettings(providerId, patch, client);

    return NextResponse.json({
      providerId,
      settings: {
        endpoint: updated.endpoint,
        hasAuthToken: Boolean(updated.authToken),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
