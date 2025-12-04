import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectModules } from "@/components/sections/ProjectModules";
import { DataPulse, buildGeometry } from "@/components/sections/DataPulse";
import {
  AutomationPlayground,
  formatProgress,
  resolveActiveStep
} from "@/components/sections/AutomationPlayground";

describe("Homepage sections", () => {
  it("détaille les modules projet avec leurs stacks", () => {
    render(<ProjectModules />);

    expect(screen.getByText("Ce que Taletaff embarque aujourd'hui.")).toBeInTheDocument();
    expect(screen.getByText("Orchestrateur d'offres")).toBeInTheDocument();
    expect(screen.getByText("supabase/migrations/20251203100000_add_job_provider_runs.sql")).toBeInTheDocument();
    expect(screen.getByText("src/app/api/jobs/bootstrap/route.ts")).toBeInTheDocument();
  });

  it("switch entre les métriques Data Pulse", async () => {
    const user = userEvent.setup();
    render(<DataPulse />);

    expect(screen.getByText("+18 % vs mois dernier")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Demandes employeurs/i }));

    expect(screen.getByText("+12 % vs mois dernier")).toBeInTheDocument();
    expect(screen.getByText("Routes /api/admin et dashboard/*.")).toBeInTheDocument();
  });

  it("calcule la géométrie même sans données", () => {
    expect(buildGeometry([])).toEqual({ pathD: "", areaD: "", points: [] });

    const singlePoint = buildGeometry([50]);
    expect(singlePoint.points).toHaveLength(1);
    expect(singlePoint.points[0]).toMatchObject({ x: 160, y: expect.any(Number), value: 50 });

    const longSeries = buildGeometry([10, 20, 30, 40, 50, 60, 70]);
    expect(longSeries.points.at(-1)?.label).toBe("M7");
  });

  it("navigue dans le playground d'automatisation", async () => {
    const user = userEvent.setup();
    render(<AutomationPlayground />);

    expect(
      screen.getByRole("button", { name: /Collecte & normalisation des offres/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Qualification & modération opérée/i }));

    expect(screen.getByText("100 % offres notées")).toBeInTheDocument();
    expect(screen.getByText("Checklists salaire/stack côté admin")).toBeInTheDocument();
  });

  it("garantit un fallback et limite la progression", () => {
    expect(resolveActiveStep("unknown-step").id).toBe("sync");
    expect(formatProgress(-12)).toBe("0%");
    expect(formatProgress(142)).toBe("100%");
    expect(formatProgress(42)).toBe("42%");
  });
});
