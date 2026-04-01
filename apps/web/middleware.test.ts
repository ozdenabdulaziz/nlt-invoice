/** @jest-environment node */
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { middleware } from "./middleware";

// Mock the getToken function from next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

describe("Feature: Session Persistence (Middleware)", () => {
  const mockDashboardUrl = "http://localhost:3000/dashboard";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SECRET = "test-secret";
  });

  it("Scenario: Session persists after page refresh", async () => {
    // Given the user is logged in
    (getToken as jest.Mock).mockResolvedValue({
      userId: "123-user-id",
      hasCompletedOnboarding: true,
    });

    // When they refresh the browser page (which fires a request to the server)
    const request = new NextRequest(new URL(mockDashboardUrl));
    const response = await middleware(request);

    // Then the session should remain active (request passes Next() instead of redirecting)
    expect(getToken).toHaveBeenCalledWith({
      req: request,
      secret: "test-secret",
    });
    
    // NextResponse.next() adds an internal header 'x-middleware-next'
    expect(response?.headers.get("x-middleware-next")).toBe("1");
    // It should not be a redirect response
    expect(response?.status).not.toBe(307);
  });

  it("Scenario: Unauthenticated user cannot access protected routes", async () => {
    // Given the user is not logged in
    (getToken as jest.Mock).mockResolvedValue(null);

    // When they navigate to the dashboard or another protected route
    const request = new NextRequest(new URL(mockDashboardUrl));
    const response = await middleware(request);

    // Then they should be redirected to the login page
    expect(response?.status).toBe(307);
    
    // The redirect URL should point to /login with the proper callbackUrl
    const redirectUrl = response?.headers.get("Location");
    expect(redirectUrl).toContain("/login");
    expect(redirectUrl).toContain("callbackUrl=%2Fdashboard");
  });

  // Additional edge case for the middleware based on onboarding rule
  it("Scenario: Authenticated user who hasn't completed onboarding should be redirected", async () => {
    // Given the user is logged in but hasn't completed onboarding
    (getToken as jest.Mock).mockResolvedValue({
      userId: "123-user-id",
      hasCompletedOnboarding: false, // Incomplete onboarding
    });

    const request = new NextRequest(new URL(mockDashboardUrl));
    const response = await middleware(request);

    // Then they should be redirected to the onboarding page
    expect(response?.status).toBe(307);
    expect(response?.headers.get("Location")).toBe("http://localhost:3000/onboarding");
  });
});
