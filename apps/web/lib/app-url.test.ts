/** @jest-environment node */

import { getAppUrl } from "@/lib/app-url";

const originalNextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalAuthUrl = process.env.AUTH_URL;

describe("getAppUrl", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;
  });

  afterAll(() => {
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

  it("throws when neither a request nor env configuration is available", () => {
    expect(() => getAppUrl()).toThrow("app-url:missing");
  });
});
