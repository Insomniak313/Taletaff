import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useJobSearch } from "@/hooks/useJobSearch";

const mockJobs = [
  {
    id: "1",
    title: "Staff Engineer",
    company: "Nova",
    location: "Paris",
    category: "engineering",
    description: "Construire des systèmes scalables",
    remote: true,
    salaryMin: 90000,
    salaryMax: 120000,
    tags: ["TypeScript"],
    createdAt: new Date().toISOString(),
  },
];

describe("useJobSearch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("récupère les offres et expose un résumé", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "engineering" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.summary.count).toBe(1);
  });

  it("gère les erreurs serveur", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Boom" }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({}));

    await waitFor(() => expect(result.current.error).toBe("Boom"));
  });

  it("utilise un message par défaut si l'API ne renvoie pas de détail", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useJobSearch({}));

    await waitFor(() =>
      expect(result.current.error).toBe("Impossible de charger les offres.")
    );
  });

  it("met à jour la catégorie", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "product" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    await act(async () => {
      result.current.setCategory("engineering");
      await result.current.fetchJobs({ category: "engineering" });
      await result.current.fetchJobs({ query: "staff" });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("category=engineering"),
      expect.anything()
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("query=staff"),
      expect.anything()
    );
  });

  it("ignore les AbortError", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue({ name: "AbortError" });
    const { result } = renderHook(() => useJobSearch({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it("gère les erreurs non standard", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue("Oops");
    const { result } = renderHook(() => useJobSearch({}));
    await waitFor(() =>
      expect(result.current.error).toBe("Une erreur inattendue est survenue.")
    );
  });

  it("expose les erreurs réseau classiques", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useJobSearch({}));
    await waitFor(() => expect(result.current.error).toBe("network"));
  });
});
