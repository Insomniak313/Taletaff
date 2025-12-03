import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StructuredData } from "@/components/Seo/StructuredData";

describe("StructuredData", () => {
  it("rend un script JSON-LD cohérent", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).not.toBeNull();
    const payload = JSON.parse(script?.innerHTML ?? "[]");
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toMatchObject({ "@type": "Organization" });
    expect(payload[1].itemListElement.length).toBeGreaterThan(2);
  });
});
