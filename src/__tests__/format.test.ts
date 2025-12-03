import { describe, expect, it } from "vitest";
import { formatCurrencyRange, formatRelativeDate } from "@/utils/format";

describe("format helpers", () => {
  it("formate une fourchette salariale", () => {
    expect(formatCurrencyRange(50000, 80000)).toContain("€");
  });

  it("formate une date relative", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(formatRelativeDate(date.toISOString())).toContain("hier");
  });
});
