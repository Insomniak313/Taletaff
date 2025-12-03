import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
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

export async function GET(request: Request) {
  try {
    await requireRole(request, ["admin"]);
    const client = supabaseAdmin();
    const { data, error } = await client
      .from("jobs")
      .select("id,title,company,source,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return handleError(error);
  }
}
