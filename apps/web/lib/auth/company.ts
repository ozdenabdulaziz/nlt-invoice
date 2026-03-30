type CompanySetupShape = {
  onboardingCompleted?: boolean | null;
};

export function hasCompletedOnboarding(company?: CompanySetupShape | null) {
  return Boolean(company?.onboardingCompleted);
}
