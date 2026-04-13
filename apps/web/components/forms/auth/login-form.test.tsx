import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/components/forms/auth/login-form";
import { SignOutButton } from "@/components/app-shell/sign-out-button";

const push = jest.fn();
const refresh = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("Feature: User Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Scenario: Registered user logs in successfully", async () => {
    // Given a registered user exists (mock successful signin)
    mockSignIn.mockResolvedValue({
      url: "/dashboard",
      error: null,
    });

    const user = userEvent.setup();
    render(<LoginForm callbackUrl="/dashboard" />);

    // When the user logs in with the correct email and password
    await user.type(screen.getByLabelText("Email"), "owner@nltinvoice.com");
    await user.type(screen.getByLabelText("Password"), "CorrectPass123");
    await user.click(screen.getByRole("button", { name: "Continue to dashboard" }));

    // Then they should be redirected to the dashboard
    // And the session should be active (verified by successful signIn mock)
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "owner@nltinvoice.com",
        password: "CorrectPass123",
        redirect: false,
        callbackUrl: "/dashboard",
      });
    });
    
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });

  it("Scenario: Login fails with the wrong password", async () => {
    // Given a registered user exists
    // When the user attempts to log in with the wrong password (mock error)
    mockSignIn.mockResolvedValue({
      error: "CredentialsSignin",
      url: null,
    });

    const user = userEvent.setup();
    render(<LoginForm callbackUrl="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "owner@nltinvoice.com");
    await user.type(screen.getByLabelText("Password"), "WrongPass123");
    await user.click(screen.getByRole("button", { name: "Continue to dashboard" }));

    // Then an error message should be displayed
    // And the user should not be authenticated
    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    
    expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({
      password: "WrongPass123"
    }));
    
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("Scenario: User can log out and log back in with the same credentials", async () => {
    // Given the user is logged in
    const user = userEvent.setup();
    const { rerender } = render(<SignOutButton />);

    // When they log out
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });

    // (simulate state clearing/navigation after logout)
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({
      url: "/dashboard",
      error: null,
    });

    // And they log in again with the correct credentials
    rerender(<LoginForm callbackUrl="/dashboard" />);
    
    await user.type(screen.getByLabelText("Email"), "owner@nltinvoice.com");
    await user.type(screen.getByLabelText("Password"), "CorrectPass123");
    await user.click(screen.getByRole("button", { name: "Continue to dashboard" }));

    // Then the system should allow access successfully
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
