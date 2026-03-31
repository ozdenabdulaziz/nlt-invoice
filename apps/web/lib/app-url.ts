function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;

  if (!value) {
    throw new Error("app-url:missing");
  }

  return trimTrailingSlash(value);
}
