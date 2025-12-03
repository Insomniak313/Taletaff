import { useCallback, useState } from "react";
import { authService } from "@/services/authService";
import type {
  AuthCredentials,
  AuthFormMode,
  AuthFormState,
  ForgotPasswordPayload,
  SignUpPayload,
} from "@/types/auth";

const defaultState: AuthFormState = {
  isLoading: false,
  hasError: false,
  message: "",
};

type SubmitPayload =
  | AuthCredentials
  | SignUpPayload
  | ForgotPasswordPayload;

const successMessages: Record<AuthFormMode, string> = {
  login: "Authentification réussie. Redirection en cours...",
  signup: "Compte créé. Consultez vos emails pour confirmer votre adresse.",
  forgot: "Email envoyé. Vérifiez votre boîte de réception pour réinitialiser.",
};

export const useAuthForm = (mode: AuthFormMode) => {
  const [state, setState] = useState<AuthFormState>(defaultState);

  const submit = useCallback(
    async (payload: SubmitPayload) => {
      setState({ ...defaultState, isLoading: true });

      try {
        if (mode === "login") {
          await authService.signIn(payload as AuthCredentials);
        } else if (mode === "signup") {
          await authService.signUp(payload as SignUpPayload);
        } else {
          await authService.resetPassword(payload as ForgotPasswordPayload);
        }

        setState({ isLoading: false, hasError: false, message: successMessages[mode] });
      } catch (error) {
        setState({
          isLoading: false,
          hasError: true,
          message:
            error instanceof Error
              ? error.message
              : "Une erreur inattendue est survenue.",
        });
      }
    },
    [mode]
  );

  const reset = () => setState(defaultState);

  return { state, submit, reset };
};
