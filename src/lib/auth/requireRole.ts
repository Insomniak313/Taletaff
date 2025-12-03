import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Authentification requise") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Accès refusé") {
    super(message);
    this.name = "ForbiddenError";
  }
}

interface RequireRoleResult {
  user: User;
  role: UserRole;
}

const parseAuthorization = (request: Request): string => {
  const header = request.headers.get("authorization");
  if (!header) {
    throw new UnauthorizedError();
  }
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) {
    throw new UnauthorizedError("Jeton invalide");
  }
  return token;
};

export const requireRole = async (
  request: Request,
  allowedRoles: UserRole[]
): Promise<RequireRoleResult> => {
  const token = parseAuthorization(request);
  const client = supabaseAdmin();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError();
  }

  const role = (data.user.user_metadata?.role ?? "jobseeker") as UserRole;

  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError();
  }

  return { user: data.user, role };
};
