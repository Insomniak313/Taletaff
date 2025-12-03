import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthForm } from "@/features/auth/components/AuthForm";

export const metadata: Metadata = {
  title: "Connexion · Taletaff",
  description: "Reprenez votre recherche d'emploi ultra ciblée en quelques secondes.",
};

const LoginPage = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16">
    <AuthCard
      title="Connexion"
      subtitle="Accédez à vos offres suivies et à vos stats de candidatures."
    >
      <AuthForm mode="login" />
      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
        <Link href="/forgot-password" className="text-brand-600">
          Mot de passe oublié ?
        </Link>
        <span>
          Pas encore de compte ? {" "}
          <Link href="/signup" className="text-brand-600">
            Créer un compte
          </Link>
        </span>
      </div>
    </AuthCard>
  </div>
);

export default LoginPage;
