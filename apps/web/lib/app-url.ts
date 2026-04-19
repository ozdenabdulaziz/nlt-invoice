function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function parseAndNormalizeAbsoluteUrl(value: string) {
  const normalizedInput = trimTrailingSlash(value.trim());

  try {
    const parsed = new URL(normalizedInput);
    return trimTrailingSlash(parsed.toString());
  } catch {
    throw new Error("app-url:invalid");
  }
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function getRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!forwardedHost) {
    return requestUrl.origin;
  }

  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  return `${protocol}://${forwardedHost}`;
}

function logResolvedAppUrl(url: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[app-url] Resolved App URL: ${url}`);
  }
  return url;
}

export function getAppUrl(request?: Request) {
  if (request) {
    const normalizedRequestOrigin = parseAndNormalizeAbsoluteUrl(getRequestOrigin(request));

    if (
      process.env.NODE_ENV === "production" &&
      isLocalhostUrl(normalizedRequestOrigin)
    ) {
      throw new Error("app-url:invalid-production-url");
    }

    return logResolvedAppUrl(normalizedRequestOrigin);
  }

  const configuredPublicUrl = process.env.NEXT_PUBLIC_APP_URL;
  const configuredAuthUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
  const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelEnvUrl = process.env.VERCEL_URL;

  const value =
    configuredPublicUrl ??
    configuredAuthUrl ??
    (vercelProjectUrl ? `https://${vercelProjectUrl}` : null) ??
    (vercelEnvUrl ? `https://${vercelEnvUrl}` : null);

  if (value) {
    const normalized = parseAndNormalizeAbsoluteUrl(value);

    if (process.env.NODE_ENV === "production" && isLocalhostUrl(normalized)) {
      throw new Error("app-url:invalid-production-url");
    }

    return logResolvedAppUrl(normalized);
  }

  if (process.env.NODE_ENV === "development") {
    return logResolvedAppUrl("http://localhost:3000");
  }

  throw new Error("app-url:missing");
}
