import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SuccessStoriesLoader } from "@/components/sections/SuccessStoriesLoader";

describe("SuccessStoriesLoader", () => {
  it("affiche le fallback pendant le chargement dynamique", () => {
    render(<SuccessStoriesLoader />);
    expect(screen.getByText("Chargement des retours…")).toBeInTheDocument();
  });
});
