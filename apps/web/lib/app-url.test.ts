/** @jest-environment node */

import { getAppUrl } from "@/lib/app-url";

const originalNextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalAuthUrl = process.env.AUTH_URL;
const originalNextAuthUrl = process.env.NEXTAUTH_URL;
const originalNodeEnv = process.env.NODE_ENV;
const mutableEnv = process.env as Record<string, string | undefined>;

describe("getAppUrl", () => {
  beforeEach(() => {
    mutableEnv.NODE_ENV = "test";
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
  });

  afterAll(() => {
    if (originalNodeEnv) {
      mutableEnv.NODE_ENV = originalNodeEnv;
    } else {
      delete mutableEnv.NODE_ENV;
    }

    if (originalNextPublicAppUrl) {
      process.env.NEXT_PUBLIC_APP_URL = originalNextPublicAppUrl;
    } else {
      delete process.env.NEXT_PUBLIC_APP_URL;
    }

    if (originalAuthUrl) {
      process.env.AUTH_URL = originalAuthUrl;
    } else {
      delete process.env.AUTH_URL;
    }

    if (originalNextAuthUrl) {
      process.env.NEXTAUTH_URL = originalNextAuthUrl;
    } else {
      delete process.env.NEXTAUTH_URL;
    }
  });

  it("prefers the current request origin when a request is available", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    process.env.AUTH_URL = "https://auth.example.com";

    const request = new Request("https://preview.vercel.app/api/stripe/checkout", {
      headers: {
        host: "preview.vercel.app",
        "x-forwarded-host": "billing.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(getAppUrl(request)).toBe("https://billing.example.com");
  });

  it("falls back to configured app url when no request is available", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com/";

    expect(getAppUrl()).toBe("https://app.example.com");
  });

  it("uses NEXTAUTH_URL when NEXT_PUBLIC_APP_URL is not defined", () => {
    process.env.NEXTAUTH_URL = "https://auth.example.com";

    expect(getAppUrl()).toBe("https://auth.example.com");
  });

  it("uses localhost fallback only in development when no env url is configured", () => {
    mutableEnv.NODE_ENV = "development";

    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("throws when neither a request nor env configuration is available", () => {
    mutableEnv.NODE_ENV = "production";

    expect(() => getAppUrl()).toThrow("app-url:missing");
  });

  it("rejects localhost urls in production", () => {
    mutableEnv.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    expect(() => getAppUrl()).toThrow("app-url:invalid-production-url");
  });
});
