"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useAuthForm } from "@/hooks/useAuthForm";

export const ForgotPasswordForm = () => {
  const { state, submit } = useAuthForm("forgot");
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit({ email });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputField
        label="Email associé au compte"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={state.isLoading}>
        {state.isLoading ? "Envoi en cours..." : "Envoyer le lien"}
      </Button>
      {state.message && (
        <p className={`text-sm ${state.hasError ? "text-red-500" : "text-emerald-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
};
