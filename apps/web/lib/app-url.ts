function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
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

export function getAppUrl(request?: Request) {
  if (request) {
    return trimTrailingSlash(getRequestOrigin(request));
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
    const normalized = trimTrailingSlash(value);

    if (process.env.NODE_ENV === "production" && isLocalhostUrl(normalized)) {
      throw new Error("app-url:invalid-production-url");
    }

    return normalized;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  throw new Error("app-url:missing");
}
