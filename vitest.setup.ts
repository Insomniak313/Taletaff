import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement, type ReactNode } from "react";

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "public-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "service-role";
process.env.NEXT_PUBLIC_SITE_URL ||= "http://localhost:3000";
process.env.NEXT_PUBLIC_DEFAULT_REDIRECT ||= "http://localhost:3000/callback";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode; href: string }) =>
    createElement("a", props, children),
}));
