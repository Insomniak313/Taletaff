import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/requireRole";
import type { UserRole } from "@/types/auth";

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

export async function GET(request: Request) {
  try {
    await requireRole(request, ["admin"]);
    const client = supabaseAdmin();
    const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) {
      throw new Error(error.message);
    }

    const users = (data?.users ?? []).map((user) => ({
      id: user.id,
      email: user.email ?? "",
      role: (user.user_metadata?.role ?? "jobseeker") as UserRole,
      createdAt: user.created_at ?? new Date().toISOString(),
    }));

    return NextResponse.json(users);
  } catch (error) {
    return handleError(error);
  }
}
