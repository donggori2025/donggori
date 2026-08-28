import { useMemo } from "react";
import { getFactoryImages } from "@/lib/factoryImages";

/** Kept as a hook for existing cards; images now come from the already-redacted API row. */
export function useFactoryImages(factory: { image?: unknown; images?: unknown } | null | undefined) {
  const images = useMemo(() => getFactoryImages(factory), [factory]);
  return { images, loading: false, error: null };
}

export function hasFactoryImages(factory: { image?: unknown; images?: unknown } | null | undefined): boolean {
  return getFactoryImages(factory).length > 0;
}
