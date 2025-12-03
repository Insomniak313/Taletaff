import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const signIn = vi.fn();
const signUp = vi.fn();
const resetPassword = vi.fn();

vi.mock("@/services/authService", () => ({
  authService: {
    signIn,
    signUp,
    resetPassword,
  },
}));

const { useAuthForm } = await import("@/hooks/useAuthForm");

describe("useAuthForm", () => {
  it("met à jour l'état après un login réussi", async () => {
    signIn.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuthForm("login"));

    await act(async () => {
      await result.current.submit({ email: "me@example.com", password: "secret" });
    });

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.message).toContain("Redirection");
  });

  it("retourne une erreur lorsque l'API échoue", async () => {
    signIn.mockRejectedValueOnce(new Error("invalid"));
    const { result } = renderHook(() => useAuthForm("login"));

    await act(async () => {
      await result.current.submit({ email: "bad@example.com", password: "nope" });
    });

    expect(result.current.state.hasError).toBe(true);
    expect(result.current.state.message).toBe("invalid");
  });

  it("supporte l'inscription", async () => {
    signUp.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuthForm("signup"));

    await act(async () => {
      await result.current.submit({
        email: "new@example.com",
        password: "secret",
        fullName: "Test",
        categoryPreferences: ["product"],
      });
    });

    expect(result.current.state.hasError).toBe(false);
  });

  it("déclenche la réinitialisation de mot de passe", async () => {
    resetPassword.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuthForm("forgot"));
    await act(async () => {
      await result.current.submit({ email: "reset@example.com" });
    });
    expect(resetPassword).toHaveBeenCalledWith({ email: "reset@example.com" });
  });

  it("fournit un message générique si l'erreur n'est pas une instance Error", async () => {
    signIn.mockRejectedValueOnce("kaput");
    const { result } = renderHook(() => useAuthForm("login"));
    await act(async () => {
      await result.current.submit({ email: "me@example.com", password: "secret" });
    });
    expect(result.current.state.message).toBe("Une erreur inattendue est survenue.");
  });

  it("réinitialise l'état via la fonction reset", () => {
    const { result } = renderHook(() => useAuthForm("login"));
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toMatchObject({ isLoading: false, hasError: false });
  });
});
