"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthFormMode } from "@/types/auth";
import { jobCategories } from "@/config/jobCategories";
import { CategoryPreferences } from "@/features/auth/components/CategoryPreferences";

interface AuthFormProps {
  mode: Exclude<AuthFormMode, "forgot">;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const isSignup = mode === "signup";
  const { state, submit } = useAuthForm(mode);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    fullName: "",
    categoryPreferences: [jobCategories[0].slug],
  });

  const updateField = (field: string, value: string | string[]) => {
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
