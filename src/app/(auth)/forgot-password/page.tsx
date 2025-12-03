import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié · Taletaff",
  description: "Recevez un lien sécurisé pour réinitialiser votre mot de passe.",
};

const ForgotPasswordPage = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16">
    <AuthCard
      title="Réinitialiser le mot de passe"
      subtitle="Nous vous enverrons un email avec un lien sécurisé."
    >
      <ForgotPasswordForm />
    </AuthCard>
  </div>
);

export default ForgotPasswordPage;
