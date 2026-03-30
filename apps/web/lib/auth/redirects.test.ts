import { getAuthenticatedHomePath } from "@/lib/auth/redirects";

describe("getAuthenticatedHomePath", () => {
  it("routes incomplete companies to onboarding", () => {
    expect(getAuthenticatedHomePath(false)).toBe("/onboarding");
  });

  it("routes completed companies to the dashboard", () => {
    expect(getAuthenticatedHomePath(true)).toBe("/dashboard");
  });
});
