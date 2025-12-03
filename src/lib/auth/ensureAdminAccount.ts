import { supabaseAdmin } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

const ADMIN_EMAIL = "admin@taletaff.com";
const ADMIN_PASSWORD = "taletaff313";
const ADMIN_ROLE: UserRole = "admin";

let ensured = false;

export const ensureAdminAccount = async () => {
  if (ensured) {
    return;
  }
  const client = supabaseAdmin();
  const { error } = await client.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: ADMIN_ROLE,
      full_name: "Admin Taletaff",
    },
  });

  if (error && !error.message?.toLowerCase().includes("already")) {
    throw new Error(`Impossible de créer le compte admin: ${error.message}`);
  }

  ensured = true;
};
