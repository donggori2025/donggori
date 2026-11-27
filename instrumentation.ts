export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development" &&
      process.env.DONGGORI_PUBLIC_FACTORY_PREVIEW === "1") {
    const { readPreviewFactoryList } = await import("./lib/publicFactoryPreview");
    // The preview proxies a remote public site. Prepare the directory before accepting visits.
    await readPreviewFactoryList().catch(() => console.warn("[factories] preview will retry on demand"));
  }
}
