import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthForm } from "@/features/auth/components/AuthForm";

export const metadata: Metadata = {
  title: "Inscription · Taletaff",
  description: "Créez un compte Taletaff pour accéder aux offres vérifiées et aux alertes personnalisées.",
};

const SignupPage = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16">
    <AuthCard
      title="Créer un compte"
      subtitle="Taillez une veille pertinente et entrez directement en contact avec les décideurs."
    >
      <AuthForm mode="signup" />
      <p className="mt-4 text-sm text-slate-600">
        Déjà membre ? <Link href="/login" className="text-brand-600">Connectez-vous</Link>
      </p>
    </AuthCard>
  </div>
);

export default SignupPage;
