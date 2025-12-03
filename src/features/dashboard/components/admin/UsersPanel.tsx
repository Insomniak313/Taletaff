import type { AdminUserSummary } from "@/types/admin";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  jobseeker: "Candidat",
  employer: "Employeur",
  moderator: "Modérateur",
  admin: "Admin",
};

interface UsersPanelProps {
  users: AdminUserSummary[];
  isLoading: boolean;
}

export const UsersPanel = ({ users, isLoading }: UsersPanelProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <header className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">Utilisateurs</p>
        <p className="text-xs text-slate-500">
          {isLoading ? "Chargement..." : `${users.length} comptes listés`}
        </p>
      </div>
    </header>
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="rounded-2xl border border-slate-100 p-3">
          <p className="text-sm font-semibold text-slate-900">{user.email}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
              {roleLabels[user.role]}
            </span>
            <span>Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      ))}
      {!users.length && !isLoading && (
        <p className="text-sm text-slate-500">Aucun utilisateur pour le moment.</p>
      )}
    </div>
  </section>
);
