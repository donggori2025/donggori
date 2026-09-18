type WriteResult = { error: { code?: string; message?: string } | null };

/** Older production tables have only `image`; readers also accept a JSON array there. */
export async function writeFactoryImages<T extends WriteResult>(
  patch: Record<string, unknown>,
  write: (data: Record<string, unknown>) => Promise<T>,
): Promise<T> {
  const result = await write(patch);
  if (
    Array.isArray(patch.images)
    && ["PGRST204", "42703"].includes(result.error?.code || "")
    && /\bimages\b/.test(result.error?.message || "")
  ) {
    const { images, ...rest } = patch;
    return write({ ...rest, image: images.length === 1 ? images[0] : JSON.stringify(images) });
  }
  return result;
}
