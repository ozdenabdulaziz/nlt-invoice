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

  const value = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;

  if (!value) {
    throw new Error("app-url:missing");
  }

  return trimTrailingSlash(value);
}
