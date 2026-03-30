import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/components/forms/auth/login-form";

const push = jest.fn();
const refresh = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits credentials and redirects on success", async () => {
    mockSignIn.mockResolvedValue({
      url: "/dashboard",
    });

    const user = userEvent.setup();

    render(<LoginForm callbackUrl="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "owner@nltinvoice.com");
    await user.type(screen.getByLabelText("Password"), "Demo1234");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "owner@nltinvoice.com",
      password: "Demo1234",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });
});
