import type { Factory } from "./factoryCatalog";

/** Local preview reads the same public catalog that visitors see on the live site. */
export function isPublicFactoryPreview() {
  return process.env.NODE_ENV === "development" && process.env.DONGGORI_PUBLIC_FACTORY_PREVIEW === "1";
}

export async function readPublicFactories(id?: string) {
  if (id && !/^\d+$/.test(id)) {
    return Response.json({ success: false, error: "업장을 찾을 수 없습니다." }, { status: 404 });
  }
  const path = id ? `/api/factories/${id}` : "/api/factories";
  const upstream = await fetch(new URL(path, "https://www.donggori.com"), {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!id) return upstream;
  return Response.json(await upstream.json(), { status: upstream.status });
}

// The local dev server proxies the live public directory. Keep one refresh in flight
// so switching between the home, directory and map doesn't restart the upstream read.
type PreviewCache = { snapshot?: { data: Factory[]; savedAt: number }; pending?: Promise<Factory[]> };
// Next loads startup instrumentation and route modules separately in development.
const previewProcess = globalThis as typeof globalThis & { donggoriPublicDirectory?: PreviewCache };
const cache = previewProcess.donggoriPublicDirectory ??= {};
const minute = 60_000;

async function refreshPreviewFactoryList(): Promise<Factory[]> {
  const response = await readPublicFactories();
  if (!response.ok) throw new Error("공장 목록 조회 실패");
  const payload = await response.json();
  if (payload.success !== true || !Array.isArray(payload.data)) throw new Error("공장 목록 형식 오류");
  cache.snapshot = { data: payload.data, savedAt: Date.now() };
  return cache.snapshot.data;
}

export function readPreviewFactoryList(maxStaleMs = 5 * minute): Promise<Factory[]> {
  const { snapshot } = cache;
  const age = snapshot ? Date.now() - snapshot.savedAt : Infinity;
  if (snapshot && age < minute) return Promise.resolve(snapshot.data);

  if (!cache.pending) {
    cache.pending = refreshPreviewFactoryList().finally(() => { cache.pending = undefined; });
    // A background refresh can fail after its caller has received the last good list.
    cache.pending.catch(() => console.warn("[factories] public preview refresh failed"));
  }
  return snapshot && age < maxStaleMs ? Promise.resolve(snapshot.data) : cache.pending;
}
