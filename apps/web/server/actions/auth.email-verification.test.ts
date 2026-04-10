/** @jest-environment node */

import {
  registerUserAction,
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@/server/actions/auth";

const mockRateLimitCheck = jest.fn();
const mockGetClientIp = jest.fn();
const mockRender = jest.fn();
const mockSendEmail = jest.fn();

const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockEmailVerificationTokenFindUnique = jest.fn();
const mockEmailVerificationTokenFindFirst = jest.fn();
const mockEmailVerificationTokenDeleteMany = jest.fn();
const mockEmailVerificationTokenCreate = jest.fn();

jest.mock("@/lib/rate-limit", () => ({
  globalRateLimiter: {
    check: (...args: unknown[]) => mockRateLimitCheck(...args),
  },
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}));

jest.mock("@react-email/components", () => ({
  render: (...args: unknown[]) => mockRender(...args),
}));

jest.mock("@/lib/email/resend", () => ({
  getResend: () => ({
    emails: {
      send: (...args: unknown[]) => mockSendEmail(...args),
    },
  }),
  getEmailFrom: () => "NLT Invoice <noreply@mail.nltinvoice.com>",
  getEmailReplyTo: () => "info@nltinvoice.com",
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    emailVerificationToken: {
      findUnique: (...args: unknown[]) => mockEmailVerificationTokenFindUnique(...args),
      findFirst: (...args: unknown[]) => mockEmailVerificationTokenFindFirst(...args),
      deleteMany: (...args: unknown[]) => mockEmailVerificationTokenDeleteMany(...args),
      create: (...args: unknown[]) => mockEmailVerificationTokenCreate(...args),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("verifyEmailAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitCheck.mockResolvedValue({ success: true, current: 1 });
    mockGetClientIp.mockResolvedValue("127.0.0.1");
  });

  it("marks user email as verified when token is valid", async () => {
    mockEmailVerificationTokenFindUnique.mockResolvedValue({
      id: "evt_1",
      email: "owner@nltinvoice.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    mockUserUpdate.mockResolvedValue({});
    mockEmailVerificationTokenDeleteMany.mockResolvedValue({ count: 1 });

    const result = await verifyEmailAction("token-valid");

    expect(result.success).toBe(true);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { email: "owner@nltinvoice.com" },
      data: { emailVerified: expect.any(Date) },
    });
    expect(mockEmailVerificationTokenDeleteMany).toHaveBeenCalledWith({
      where: { email: "owner@nltinvoice.com" },
    });
  });

  it("returns expired error and does not verify user when token is expired", async () => {
    mockEmailVerificationTokenFindUnique.mockResolvedValue({
      id: "evt_2",
      email: "owner@nltinvoice.com",
      expiresAt: new Date(Date.now() - 10 * 60 * 1000),
    });
    mockEmailVerificationTokenDeleteMany.mockResolvedValue({ count: 1 });

    const result = await verifyEmailAction("token-expired");

    expect(result.success).toBe(false);
    expect(result.message).toContain("expired");
    expect(mockUserUpdate).not.toHaveBeenCalled();
    expect(mockEmailVerificationTokenDeleteMany).toHaveBeenCalledWith({
      where: { email: "owner@nltinvoice.com" },
    });
  });

  it("returns invalid error for unknown token", async () => {
    mockEmailVerificationTokenFindUnique.mockResolvedValue(null);

    const result = await verifyEmailAction("token-invalid");

    expect(result.success).toBe(false);
    expect(result.message).toContain("invalid");
    expect(mockUserUpdate).not.toHaveBeenCalled();
    expect(mockEmailVerificationTokenDeleteMany).not.toHaveBeenCalled();
  });
});

describe("registerUserAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitCheck.mockResolvedValue({ success: true, current: 1 });
    mockGetClientIp.mockResolvedValue("127.0.0.1");
    mockRender.mockResolvedValue("<html>verify</html>");
    mockSendEmail.mockResolvedValue({ data: { id: "re_register_123" }, error: null });
    mockUserCreate.mockResolvedValue({ id: "user_1" });
    mockEmailVerificationTokenCreate.mockResolvedValue({ id: "evt_register_1" });
  });

  it("always sends verification email on new registration", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockEmailVerificationTokenFindFirst.mockResolvedValue({
      createdAt: new Date(),
    });

    const result = await registerUserAction({
      name: "Owner",
      email: "owner@nltinvoice.com",
      password: "Demo1234",
      confirmPassword: "Demo1234",
    });

    expect(result.success).toBe(true);
    expect(mockEmailVerificationTokenCreate).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@nltinvoice.com",
        subject: "Verify your email – NLT Invoice",
      }),
    );
    expect(mockEmailVerificationTokenFindFirst).not.toHaveBeenCalled();
  });
});

describe("resendVerificationEmailAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitCheck.mockResolvedValue({ success: true, current: 1 });
    mockGetClientIp.mockResolvedValue("127.0.0.1");
    mockRender.mockResolvedValue("<html>verify</html>");
    mockEmailVerificationTokenDeleteMany.mockResolvedValue({ count: 1 });
    mockEmailVerificationTokenCreate.mockResolvedValue({ id: "evt_3" });
    mockSendEmail.mockResolvedValue({ data: { id: "re_123" }, error: null });
  });

  it("enforces resend cooldown and skips token creation and email send", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "owner@nltinvoice.com",
      emailVerified: null,
    });
    mockEmailVerificationTokenFindFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 15 * 1000),
    });

    const result = await resendVerificationEmailAction({
      email: "owner@nltinvoice.com",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Please wait");
    expect(mockEmailVerificationTokenCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("creates token and sends email when cooldown window is passed", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "owner@nltinvoice.com",
      emailVerified: null,
    });
    mockEmailVerificationTokenFindFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    });

    const result = await resendVerificationEmailAction({
      email: "owner@nltinvoice.com",
    });

    expect(result.success).toBe(true);
    expect(mockEmailVerificationTokenCreate).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "NLT Invoice <noreply@mail.nltinvoice.com>",
        replyTo: "info@nltinvoice.com",
        to: "owner@nltinvoice.com",
        subject: "Verify your email – NLT Invoice",
      }),
    );
  });
});
