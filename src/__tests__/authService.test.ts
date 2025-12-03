import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthReturn = { data?: unknown; error: { message: string } | null };

const authMock = {
  signInWithPassword: vi.fn<(payload?: unknown) => Promise<AuthReturn>>(),
  signUp: vi.fn<(payload?: unknown) => Promise<AuthReturn>>(),
  resetPasswordForEmail: vi.fn<(email?: string, options?: unknown) => Promise<AuthReturn>>(),
};

vi.mock("@/lib/supabase/browser", () => ({
  supabaseBrowser: () => ({ auth: authMock }),
}));

const { authService } = await import("@/services/authService");

describe("authService", () => {
  beforeEach(() => {
    Object.values(authMock).forEach((mock) => mock.mockReset());
  });

  it("authentifie un utilisateur", async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({ data: {}, error: null });
    await expect(
      authService.signIn({ email: "hi@example.com", password: "secret" })
    ).resolves.toBeUndefined();
  });

  it("propage les erreurs de connexion", async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({
      error: { message: "invalid" },
    });
    await expect(
      authService.signIn({ email: "err@example.com", password: "bad" })
    ).rejects.toThrow("invalid");
  });

  it("crée un compte avec metadata", async () => {
    authMock.signUp.mockResolvedValueOnce({ data: {}, error: null });
    await expect(
      authService.signUp({
        email: "new@example.com",
        password: "secret",
        fullName: "Test User",
        categoryPreferences: ["product"],
        role: "jobseeker",
      })
    ).resolves.toBeUndefined();
  });

  it("envoie un email de reset", async () => {
    authMock.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });
    await authService.resetPassword({ email: "reset@example.com" });
    expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith(
      "reset@example.com",
      expect.objectContaining({ redirectTo: expect.any(String) })
    );
  });

  it("propage les erreurs d'inscription", async () => {
    authMock.signUp.mockResolvedValueOnce({ error: { message: "signup" } });
    await expect(
      authService.signUp({
        email: "new@example.com",
        password: "secret",
        fullName: "Test User",
        categoryPreferences: [],
        role: "jobseeker",
      })
    ).rejects.toThrow("signup");
  });

  it("propage les erreurs de reset", async () => {
    authMock.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: "reset" } });
    await expect(authService.resetPassword({ email: "reset@example.com" })).rejects.toThrow(
      "reset"
    );
  });
});
