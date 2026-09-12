export const DESTINATION_IMAGE_BUCKET = "destinations";

/** Relative Storage paths only. No signed URLs, queries, traversal or SVG. */
export function isDestinationImagePath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.length <= 320 &&
    /^[a-zA-Z0-9_-]+\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(webp|avif)$/i.test(
      path,
    )
  );
}

export function destinationStorageOrigin(
  baseUrl: string | undefined,
): string | null {
  if (!baseUrl) return null;
  try {
    const url = new URL(baseUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getDestinationImageUrl(
  path: string | null | undefined,
  baseUrl: string | undefined,
): string | null {
  const origin = destinationStorageOrigin(baseUrl);
  if (!origin || !isDestinationImagePath(path)) return null;
  return `${origin}/storage/v1/object/public/${DESTINATION_IMAGE_BUCKET}/${path}`;
}

export function destinationImageRemotePatterns(baseUrl: string | undefined) {
  const origin = destinationStorageOrigin(baseUrl);
  return origin
    ? [
        {
          protocol: "https" as const,
          hostname: new URL(origin).hostname,
          port: "",
          pathname: `/storage/v1/object/public/${DESTINATION_IMAGE_BUCKET}/**`,
          search: "",
        },
      ]
    : [];
}

export function destinationImageAlt(name: string, country: string): string {
  return `Surf à ${name}, ${country}`;
}
