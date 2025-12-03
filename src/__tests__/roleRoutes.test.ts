import { describe, expect, it } from "vitest";
import { ROLE_HOME_ROUTE } from "@/config/roleRoutes";

describe("ROLE_HOME_ROUTE", () => {
  it("associe chaque rôle à une route dédiée", () => {
    expect(ROLE_HOME_ROUTE.jobseeker).toBe("/dashboard/candidat");
    expect(ROLE_HOME_ROUTE.employer).toBe("/dashboard/employeur");
    expect(ROLE_HOME_ROUTE.moderator).toBe("/dashboard/moderation");
    expect(ROLE_HOME_ROUTE.admin).toBe("/dashboard/admin");
  });
});
