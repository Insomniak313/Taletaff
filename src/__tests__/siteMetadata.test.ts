import { describe, expect, it } from "vitest";
import { siteMetadata } from "@/config/siteMetadata";

describe("siteMetadata", () => {
  it("fournit un titre et une description", () => {
    expect(siteMetadata.title).toContain("Taletaff");
    expect(siteMetadata.description.length).toBeGreaterThan(10);
  });
});
