function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getRequestOrigin(request: Request) {
  const configuredOrigin = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto")) || "http";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
