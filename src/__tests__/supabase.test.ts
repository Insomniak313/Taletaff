import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn(() => ({}));

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

describe("clients Supabase", () => {
  beforeEach(() => {
    createClient.mockClear();
  });

  it("configure le client navigateur avec persistance", async () => {
    const { supabaseBrowser } = await import("@/lib/supabase/browser");
    supabaseBrowser();
    expect(createClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      auth: expect.objectContaining({ persistSession: true }),
    });
  });

  it("configure le client serveur sans session", async () => {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    supabaseAdmin();
    expect(createClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      auth: expect.objectContaining({ persistSession: false }),
    });
  });
});
