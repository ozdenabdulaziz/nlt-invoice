import { hasCompletedOnboarding } from "@/lib/auth/company";

describe("hasCompletedOnboarding", () => {
  it("returns false when the company record is missing", () => {
    expect(hasCompletedOnboarding(null)).toBe(false);
  });

  it("returns false when onboarding is not completed", () => {
    expect(
      hasCompletedOnboarding({
        onboardingCompleted: false,
      }),
    ).toBe(false);
  });

  it("returns true when onboardingCompleted is true", () => {
    expect(
      hasCompletedOnboarding({
        onboardingCompleted: true,
      }),
    ).toBe(true);
  });
});
