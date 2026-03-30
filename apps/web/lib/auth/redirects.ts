export function getAuthenticatedHomePath(hasCompletedOnboarding: boolean) {
  return hasCompletedOnboarding ? "/dashboard" : "/onboarding";
}
