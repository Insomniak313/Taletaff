export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpPayload extends AuthCredentials {
  fullName: string;
  categoryPreferences: string[];
}

export interface ForgotPasswordPayload {
  email: string;
  redirectTo?: string;
}

export interface AuthFormState {
  isLoading: boolean;
  hasError: boolean;
  message: string;
}

export type AuthFormMode = "login" | "signup" | "forgot";
