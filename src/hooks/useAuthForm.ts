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

const genericErrorMessages: Record<AuthFormMode, string> = {
  login: "Connexion impossible pour le moment. Réessayez dans quelques instants.",
  signup: "Création du compte impossible pour le moment. Merci de réessayer.",
  forgot: "Impossible d'envoyer l'email de réinitialisation. Réessayez plus tard.",
};

const errorDictionary: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /invalid login credentials/i,
    message: "Identifiants incorrects. Vérifiez votre email ou votre mot de passe.",
  },
  {
    pattern: /email not confirmed/i,
    message: "Votre adresse email doit être confirmée avant de vous connecter.",
  },
  {
    pattern: /user already registered/i,
    message: "Ce compte existe déjà. Connectez-vous ou réinitialisez votre mot de passe.",
  },
  {
    pattern: /password (?:should|must) be at least/i,
    message: "Votre mot de passe doit contenir au moins 6 caractères.",
  },
  {
    pattern: /token has expired/i,
    message: "Le lien a expiré. Demandez un nouvel email de réinitialisation.",
  },
];

const translateAuthErrorMessage = (mode: AuthFormMode, rawMessage?: string): string => {
  if (rawMessage) {
    const normalized = rawMessage.trim();
    const match = errorDictionary.find((entry) => entry.pattern.test(normalized));
    if (match) {
      return match.message;
    }
  }
  return genericErrorMessages[mode];
};

export const useAuthForm = (mode: AuthFormMode) => {
  const [state, setState] = useState<AuthFormState>(defaultState);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<boolean> => {
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
        return true;
      } catch (error) {
        setState({
          isLoading: false,
          hasError: true,
          message: translateAuthErrorMessage(
            mode,
            error instanceof Error ? error.message : undefined
          ),
        });
        return false;
      }
    },
    [mode]
  );

  const reset = () => setState(defaultState);

  return { state, submit, reset };
};
