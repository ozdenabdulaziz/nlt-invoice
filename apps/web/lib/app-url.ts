function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
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

  const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelEnvUrl = process.env.VERCEL_URL;

  const value =
    process.env.NEXT_PUBLIC_APP_URL ??
    (vercelProjectUrl ? `https://${vercelProjectUrl}` : null) ??
    (vercelEnvUrl ? `https://${vercelEnvUrl}` : null) ??
    process.env.AUTH_URL ??
    "http://localhost:3000";

  return trimTrailingSlash(value);
}
