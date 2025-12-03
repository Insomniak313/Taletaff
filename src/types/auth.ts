export interface AuthCredentials {
  email: string;
  password: string;
}

export type UserRole = "jobseeker" | "employer" | "moderator" | "admin";

export interface SignUpPayload extends AuthCredentials {
  fullName: string;
  categoryPreferences: string[];
  role: UserRole;
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
