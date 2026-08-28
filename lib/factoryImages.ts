const FALLBACK_IMAGE = "/logo_donggori.png";

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  } catch {
    // A single URL is the normal legacy format.
  }
  return [value.trim()];
}

/** Images are administered in the factory row. Do not derive public URLs from a name. */
export function getFactoryImages(value: unknown): string[] {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return Array.from(new Set([...strings(row.images), ...strings(row.image)]));
}

export function getFactoryMainImage(value: unknown): string {
  return getFactoryImages(value)[0] || FALLBACK_IMAGE;
}

export function hasFactoryImages(value: unknown): boolean {
  return getFactoryImages(value).length > 0;
}
