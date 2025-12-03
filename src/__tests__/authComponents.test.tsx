import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

const submit = vi.fn().mockResolvedValue(true);
const reset = vi.fn();
const state = { isLoading: false, hasError: false, message: "" };
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/hooks/useAuthForm", () => ({
  useAuthForm: () => ({
    state,
    submit,
    reset,
  }),
}));

describe("Composants auth", () => {
  beforeEach(() => {
    submit.mockClear();
    submit.mockResolvedValue(true);
    state.isLoading = false;
    state.hasError = false;
    state.message = "";
    replaceMock.mockClear();
  });

  it("rend l'AuthCard", () => {
    render(
      <AuthCard title="Titre" subtitle="Sous-titre">
        <p>Contenu</p>
      </AuthCard>
    );
    expect(screen.getByText("Titre")).toBeInTheDocument();
  });

  it("soumet le formulaire de login", () => {
    render(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: "secret" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Se connecter/i }));
    expect(submit).toHaveBeenCalled();
  });

  it("redirige vers le dashboard après un login réussi", async () => {
    render(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: "secret" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Se connecter/i }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("gère la sélection des préférences en signup", () => {
    render(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText(/Prénom et nom/i), {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: "secret" },
    });
    const preferenceButtons = screen.getAllByRole("button", {
      name: /Produit|Ingénierie|Marketing|Operations/,
    });
    fireEvent.click(preferenceButtons[0]);
    fireEvent.click(preferenceButtons[0]);
    fireEvent.click(preferenceButtons[1]);
    fireEvent.click(screen.getByRole("button", { name: /Créer mon compte/i }));
    expect(submit).toHaveBeenCalled();
  });

  it("permet de sélectionner un rôle avant inscription", () => {
    render(<AuthForm mode="signup" />);
    const employerRadio = screen.getByLabelText(/Employeur/i) as HTMLInputElement;
    expect(employerRadio.checked).toBe(false);
    fireEvent.click(employerRadio);
    expect(employerRadio.checked).toBe(true);
  });

  it("soumet la demande de reset", () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText(/Email associé/i), {
      target: { value: "reset@example.com" },
    });
    fireEvent.click(screen.getByRole("button"));
    expect(submit).toHaveBeenCalled();
  });

  it("affiche le message de feedback dans le formulaire", () => {
    state.message = "OK";
    state.hasError = false;
    render(<AuthForm mode="login" />);
    expect(screen.getByText("OK")).toHaveClass("text-sm");
  });

  it("affiche les erreurs dans le formulaire", () => {
    state.message = "Erreur";
    state.hasError = true;
    render(<AuthForm mode="login" />);
    expect(screen.getByText("Erreur")).toHaveClass("text-red-500");
  });

  it("affiche les messages d'état du reset", () => {
    state.message = "Erreur";
    state.hasError = true;
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Erreur")).toBeInTheDocument();
  });

  it("affiche un message positif pour le reset", () => {
    state.message = "Envoyé";
    state.hasError = false;
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Envoyé")).toHaveClass("text-emerald-600");
  });

  it("affiche les états de chargement", () => {
    state.isLoading = true;
    render(<AuthForm mode="login" />);
    expect(screen.getByText("Traitement...")).toBeInTheDocument();
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Envoi en cours...")).toBeInTheDocument();
  });
});
