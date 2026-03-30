/** @jest-environment node */

import { registerUserAction } from "@/server/actions/auth";

const mockFindUnique = jest.fn();
const mockHash = jest.fn();
const mockUserCreate = jest.fn();

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: (...args: unknown[]) => mockHash(...args),
  },
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
  },
}));

describe("registerUserAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHash.mockResolvedValue("hashed-password");
    mockUserCreate.mockResolvedValue({ id: "user_1" });
  });

  it("creates the user record on success", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await registerUserAction({
      name: "Abdulaziz Ozden",
      email: "owner@nltinvoice.com",
      password: "Demo1234",
      confirmPassword: "Demo1234",
    });

    expect(result.success).toBe(true);
    expect(mockHash).toHaveBeenCalledWith("Demo1234", 12);
    expect(mockUserCreate).toHaveBeenCalled();
    expect(result.data?.redirectTo).toBe("/onboarding");
  });

  it("returns a field error when the email already exists", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing_user" });

    const result = await registerUserAction({
      name: "Abdulaziz Ozden",
      email: "owner@nltinvoice.com",
      password: "Demo1234",
      confirmPassword: "Demo1234",
    });

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.email).toContain(
      "An account with this email already exists.",
    );
    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});
