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

const mockSummary = {
  count: 1,
  remoteShare: 1,
  salaryRange: { min: 90000, max: 120000 },
  topLocations: [{ label: "Paris", count: 1 }],
  topTags: [{ label: "TypeScript", count: 1 }],
};

describe("useJobSearch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("récupère les offres et expose un résumé", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs, summary: mockSummary }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "engineering" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.summary.count).toBe(1);
    expect(result.current.summary.topTags[0].label).toBe("TypeScript");
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

  it("retombe sur un résumé par défaut si l'API ne renvoie rien", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({}));

    await waitFor(() => expect(result.current.summary.count).toBe(0));
    expect(result.current.summary.remoteShare).toBe(0);
  });

  it("met à jour la catégorie", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs, summary: mockSummary }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "product" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    await act(async () => {
      result.current.setCategory("engineering");
      await result.current.fetchJobs({ category: "engineering" });
      await result.current.fetchJobs({ query: "staff" });
    });

    const calledUrls = fetchSpy.mock.calls.map((call) => call[0] as string);
    expect(calledUrls.some((url) => url.includes("category=engineering"))).toBe(true);
    expect(calledUrls.some((url) => url.includes("query=staff"))).toBe(true);
  });

  it("applique les filtres avancés", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs, summary: mockSummary }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "engineering" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    await act(async () => {
      result.current.setLocation("Paris");
      result.current.toggleRemoteOnly();
      result.current.setSalaryFloor(80000);
      result.current.toggleTag("TypeScript");
      await result.current.fetchJobs();
    });

    const lastCall = (fetchSpy.mock.calls.at(-1)?.[0] as string) ?? "";
    expect(lastCall).toContain("remote=true");
    expect(lastCall).toContain("location=Paris");
    expect(lastCall).toContain("minSalary=80000");
    expect(lastCall).toContain("tags=TypeScript");
  });

  it("applique et réinitialise le filtre provider", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs, summary: mockSummary }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({}));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    await act(async () => {
      result.current.setProvider("apec");
      await result.current.fetchJobs();
    });

    const lastUrl = (fetchSpy.mock.calls.at(-1)?.[0] as string) ?? "";
    expect(lastUrl).toContain("provider=apec");

    await act(async () => {
      result.current.resetFilters();
    });

    expect(result.current.provider).toBeUndefined();
  });

  it("réinitialise les filtres étendus", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: mockJobs, summary: mockSummary }),
    } as Response);

    const { result } = renderHook(() => useJobSearch({ initialCategory: "engineering" }));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    await act(async () => {
      result.current.setQuery("remote");
      result.current.toggleTag("Remote");
      result.current.toggleTag("Remote");
      result.current.setLocation("Paris");
      result.current.toggleRemoteOnly();
      result.current.setSalaryFloor(75000);
      result.current.resetFilters();
    });

    expect(result.current.query).toBe("");
    expect(result.current.location).toBe("");
    expect(result.current.remoteOnly).toBe(false);
    expect(result.current.salaryFloor).toBeNull();
    expect(result.current.selectedTags).toEqual([]);
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
