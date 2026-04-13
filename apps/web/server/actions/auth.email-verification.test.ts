/** @jest-environment node */

import {
  registerUserAction,
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@/server/actions/auth";

const mockRateLimitCheck = jest.fn();
const mockGetClientIp = jest.fn();
const mockRequireSession = jest.fn();
const mockRender = jest.fn();
const mockSendEmail = jest.fn();

const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserUpdateMany = jest.fn();
const mockEmailVerificationTokenFindUnique = jest.fn();
const mockEmailVerificationTokenFindFirst = jest.fn();
const mockEmailVerificationTokenDeleteMany = jest.fn();
const mockEmailVerificationTokenCreate = jest.fn();
const mockTxQueryRaw = jest.fn();
const mockPrismaTransaction = jest.fn();

jest.mock("@/lib/rate-limit", () => ({
  globalRateLimiter: {
    check: (...args: unknown[]) => mockRateLimitCheck(...args),
  },
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}));

jest.mock("@/lib/auth/session", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
}));

jest.mock("@react-email/components", () => ({
  render: (...args: unknown[]) => mockRender(...args),
}));

jest.mock("@/lib/email/resend", () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => mockSendEmail(...args),
    },
  },
  getEmailFrom: () => "NLT Invoice <noreply@mail.nltinvoice.com>",
  getEmailReplyTo: () => "info@nltinvoice.com",
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockPrismaTransaction(...args),
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
      updateMany: (...args: unknown[]) => mockUserUpdateMany(...args),
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
    mockPrismaTransaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        user: {
          create: (...args: unknown[]) => mockUserCreate(...args),
          updateMany: (...args: unknown[]) => mockUserUpdateMany(...args),
        },
        emailVerificationToken: {
          findUnique: (...args: unknown[]) => mockEmailVerificationTokenFindUnique(...args),
          findFirst: (...args: unknown[]) => mockEmailVerificationTokenFindFirst(...args),
          deleteMany: (...args: unknown[]) => mockEmailVerificationTokenDeleteMany(...args),
          create: (...args: unknown[]) => mockEmailVerificationTokenCreate(...args),
        },
        $queryRaw: (...args: unknown[]) => mockTxQueryRaw(...args),
      }),
    );
  });

  it("marks user email as verified when token is valid", async () => {
    mockEmailVerificationTokenFindUnique.mockResolvedValue({
      id: "evt_1",
      email: "owner@nltinvoice.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    mockUserUpdateMany.mockResolvedValue({ count: 1 });
    mockEmailVerificationTokenDeleteMany.mockResolvedValue({ count: 1 });

    const result = await verifyEmailAction("token-valid");

    expect(result.success).toBe(true);
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { email: "owner@nltinvoice.com", emailVerified: null },
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
    expect(mockUserUpdateMany).not.toHaveBeenCalled();
    expect(mockEmailVerificationTokenDeleteMany).toHaveBeenCalledWith({
      where: { email: "owner@nltinvoice.com" },
    });
  });

  it("returns invalid error for unknown token", async () => {
    mockEmailVerificationTokenFindUnique.mockResolvedValue(null);

    const result = await verifyEmailAction("token-invalid");

    expect(result.success).toBe(false);
    expect(result.message).toContain("invalid");
    expect(mockUserUpdateMany).not.toHaveBeenCalled();
    expect(mockEmailVerificationTokenDeleteMany).not.toHaveBeenCalled();
  });
});

describe("registerUserAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitCheck.mockResolvedValue({ success: true, current: 1 });
    mockGetClientIp.mockResolvedValue("127.0.0.1");
    mockRender.mockResolvedValue("<html>verify</html>");
    mockSendEmail.mockResolvedValue({ data: { id: "msg_register_123" }, error: null });
    mockUserCreate.mockResolvedValue({ id: "user_1" });
    mockEmailVerificationTokenCreate.mockResolvedValue({ id: "evt_register_1" });
    mockPrismaTransaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        user: {
          create: (...args: unknown[]) => mockUserCreate(...args),
          updateMany: (...args: unknown[]) => mockUserUpdateMany(...args),
        },
        emailVerificationToken: {
          findUnique: (...args: unknown[]) => mockEmailVerificationTokenFindUnique(...args),
          findFirst: (...args: unknown[]) => mockEmailVerificationTokenFindFirst(...args),
          deleteMany: (...args: unknown[]) => mockEmailVerificationTokenDeleteMany(...args),
          create: (...args: unknown[]) => mockEmailVerificationTokenCreate(...args),
        },
        $queryRaw: (...args: unknown[]) => mockTxQueryRaw(...args),
      }),
    );
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
    mockRequireSession.mockResolvedValue({
      user: {
        id: "user_1",
        email: "owner@nltinvoice.com",
      },
    });
    mockRender.mockResolvedValue("<html>verify</html>");
    mockEmailVerificationTokenDeleteMany.mockResolvedValue({ count: 1 });
    mockEmailVerificationTokenCreate.mockResolvedValue({ id: "evt_3" });
    mockSendEmail.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    mockPrismaTransaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        user: {
          create: (...args: unknown[]) => mockUserCreate(...args),
          updateMany: (...args: unknown[]) => mockUserUpdateMany(...args),
        },
        emailVerificationToken: {
          findUnique: (...args: unknown[]) => mockEmailVerificationTokenFindUnique(...args),
          findFirst: (...args: unknown[]) => mockEmailVerificationTokenFindFirst(...args),
          deleteMany: (...args: unknown[]) => mockEmailVerificationTokenDeleteMany(...args),
          create: (...args: unknown[]) => mockEmailVerificationTokenCreate(...args),
        },
        $queryRaw: (...args: unknown[]) => mockTxQueryRaw(...args),
      }),
    );
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

    const result = await resendVerificationEmailAction();

    expect(result.success).toBe(false);
    expect(result.message).toContain("Please wait");
    expect(mockRateLimitCheck).not.toHaveBeenCalled();
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

    const result = await resendVerificationEmailAction();

    expect(result.success).toBe(true);
    expect(mockRateLimitCheck).toHaveBeenCalledWith({
      id: "resend_email_owner@nltinvoice.com",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
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

  it("blocks resend after 5 attempts in 1 hour", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "owner@nltinvoice.com",
      emailVerified: null,
    });
    mockEmailVerificationTokenFindFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    });
    mockRateLimitCheck.mockResolvedValue({
      success: false,
      current: 5,
    });

    const result = await resendVerificationEmailAction();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Too many resend attempts. Please try again in 1 hour.",
    );
    expect(mockEmailVerificationTokenDeleteMany).not.toHaveBeenCalled();
    expect(mockEmailVerificationTokenCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
