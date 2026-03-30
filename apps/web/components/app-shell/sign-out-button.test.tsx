import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignOutButton } from "@/components/app-shell/sign-out-button";

const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls signOut with the marketing page callback", async () => {
    const user = userEvent.setup();

    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mockSignOut).toHaveBeenCalledWith({
      callbackUrl: "/",
    });
  });
});
