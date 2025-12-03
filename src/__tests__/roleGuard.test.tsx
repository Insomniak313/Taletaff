import { render, screen } from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGuard } from "@/features/auth/components/RoleGuard";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

const buildSession = (role: string): Session =>
  ({
    access_token: "token",
    user: { user_metadata: { role } },
  } as unknown as Session);

describe("RoleGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    useCurrentUserMock.mockReset();
  });

  it("affiche un état de chargement tant que la session arrive", () => {
    useCurrentUserMock.mockReturnValue({ session: null, role: "jobseeker", isLoading: true });
    render(
      <RoleGuard allowedRoles={["jobseeker"]}>
        <p>Contenu protégé</p>
      </RoleGuard>
    );
    expect(screen.getByText(/Chargement de votre session/)).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirige vers la page de connexion si aucun utilisateur n'est authentifié", () => {
    useCurrentUserMock.mockReturnValue({ session: null, role: "jobseeker", isLoading: false });
    render(
      <RoleGuard allowedRoles={["jobseeker"]}>
        <p>Contenu protégé</p>
      </RoleGuard>
    );
    expect(replaceMock).toHaveBeenCalledWith("/login");
    expect(screen.getByText(/Redirection en cours/)).toBeInTheDocument();
  });

  it("rend le contenu quand le rôle est autorisé", () => {
    useCurrentUserMock.mockReturnValue({
      session: buildSession("jobseeker"),
      role: "jobseeker",
      isLoading: false,
    });
    render(
      <RoleGuard allowedRoles={["jobseeker"]}>
        <p>Accès garanti</p>
      </RoleGuard>
    );
    expect(screen.getByText("Accès garanti")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirige vers la home adaptée si le rôle n'est pas autorisé", () => {
    useCurrentUserMock.mockReturnValue({
      session: buildSession("employer"),
      role: "employer",
      isLoading: false,
    });
    render(
      <RoleGuard allowedRoles={["jobseeker"]}>
        <p>Accès refusé</p>
      </RoleGuard>
    );
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/employeur");
    expect(screen.getByText(/Redirection en cours/)).toBeInTheDocument();
  });
});
