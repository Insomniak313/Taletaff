import { beforeEach, describe, expect, it, vi } from "vitest";

const setBaseEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.NEXT_PUBLIC_SITE_URL = "https://taletaff.com";
  process.env.NEXT_PUBLIC_DEFAULT_REDIRECT = "https://taletaff.com/callback";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
};

describe("env modules", () => {
  beforeEach(() => {
    vi.resetModules();
    setBaseEnv();
  });

  it("expose les variables publiques", async () => {
    const { clientEnv } = await import("@/lib/env.client");
    expect(clientEnv.supabaseUrl).toBe("https://example.supabase.co");
    expect(clientEnv.defaultRedirect).toContain("callback");
  });

  it("signale les variables manquantes côté client", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(import("@/lib/env.client")).rejects.toThrow(
      "NEXT_PUBLIC_SUPABASE_URL"
    );
  });

  it("expose la clé service côté serveur", async () => {
    const { serverEnv } = await import("@/lib/env.server");
    expect(serverEnv.supabaseServiceRoleKey).toBe("service");
  });

  it("signale l'absence de clé service", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(import("@/lib/env.server")).rejects.toThrow(
      "SUPABASE_SERVICE_ROLE_KEY"
    );
  });
});
