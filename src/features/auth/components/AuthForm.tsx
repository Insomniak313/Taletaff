"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthFormMode, UserRole } from "@/types/auth";
import { jobCategories } from "@/config/jobCategories";
import { CategoryPreferences } from "@/features/auth/components/CategoryPreferences";

interface AuthFormProps {
  mode: Exclude<AuthFormMode, "forgot">;
}

const roleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  { value: "jobseeker", label: "Chercheur d'emploi", description: "Suivez vos candidatures et recevez des alertes ciblées." },
  { value: "employer", label: "Employeur", description: "Publiez vos offres et suivez vos performances." },
  { value: "moderator", label: "Modérateur", description: "Validez les offres et surveillez les signalements." },
  { value: "admin", label: "Admin", description: "Gérez les comptes, les scrapers et les jobs." },
];

type SignUpFormValues = {
  email: string;
  password: string;
  fullName: string;
  categoryPreferences: string[];
  role: UserRole;
};

export const AuthForm = ({ mode }: AuthFormProps) => {
  const isSignup = mode === "signup";
  const { state, submit } = useAuthForm(mode);
  const [formValues, setFormValues] = useState<SignUpFormValues>({
    email: "",
    password: "",
    fullName: "",
    categoryPreferences: [jobCategories[0].slug],
    role: "jobseeker",
  });

  const updateField = <Key extends keyof SignUpFormValues>(field: Key, value: SignUpFormValues[Key]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSignup) {
      await submit(formValues);
      return;
    }

    await submit({ email: formValues.email, password: formValues.password });
  };

  const togglePreference = (slug: string) => {
    setFormValues((prev) => {
      const alreadySelected = prev.categoryPreferences.includes(slug);
      const nextPreferences = alreadySelected
        ? prev.categoryPreferences.filter((pref) => pref !== slug)
        : [...prev.categoryPreferences, slug];

      return { ...prev, categoryPreferences: nextPreferences };
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isSignup && (
        <InputField
          label="Prénom et nom"
          value={formValues.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          required
        />
      )}
      <InputField
        label="Email professionnel"
        type="email"
        value={formValues.email}
        onChange={(event) => updateField("email", event.target.value)}
        required
        autoComplete="email"
      />
      <InputField
        label="Mot de passe"
        type="password"
        value={formValues.password}
        onChange={(event) => updateField("password", event.target.value)}
        required
        autoComplete={isSignup ? "new-password" : "current-password"}
      />
      {isSignup && (
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-900">
            Quel est votre rôle ?
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition ${
                  formValues.role === option.value ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formValues.role === option.value}
                    onChange={(event) => updateField("role", event.target.value as UserRole)}
                    className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {option.label}
                </span>
                <span className="text-xs text-slate-600">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {isSignup && (
        <CategoryPreferences
          selected={formValues.categoryPreferences}
          onToggle={togglePreference}
        />
      )}
      <Button type="submit" disabled={state.isLoading} className="w-full">
        {state.isLoading ? "Traitement..." : isSignup ? "Créer mon compte" : "Se connecter"}
      </Button>
      {state.message && (
        <p className={`text-sm ${state.hasError ? "text-red-500" : "text-emerald-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
};
