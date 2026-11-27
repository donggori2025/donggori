import { createHash, randomUUID } from "node:crypto";
import { link, mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Presentation data stays on the host's private disk, outside public assets and the live factory DB.
const root = () => process.env.STUDIO_INBOX_DIR || path.join(process.cwd(), ".donggori-studio");
const uuid = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
export const sampleParkaInquiryId = "1e0ae02f-8360-4a26-8271-2bf7e930fe90";
export type Speaker = "designer" | "coordinator";
export type FactoryCard = { id: string; name: string; photo?: string; district: string; item: string; reason: string };
export type StudioMessage = { id: string; author: Speaker; text: string; cards?: FactoryCard[]; at: number };
type Metadata = { owner: string | null; pinned?: boolean; request: string } & (
  | { sheet: "m65-parka-v1" }
  | { sheet: null; title: string }
);
export type Inquiry = Metadata & { id: string; messages: StudioMessage[]; opened: boolean };
const ownerHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const ownsInquiry = (inquiry: Inquiry, token?: string) => Boolean(token && inquiry.owner === ownerHash(token));
const hasCode = (error: unknown, code: string) => (error as NodeJS.ErrnoException)?.code === code;

export async function createInquiry(token: string, request: string, withSheet = true) {
  const id = randomUUID();
  const dir = path.join(root(), id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const meta: Metadata = { owner: ownerHash(token), request: request.slice(0, 4000), ...(withSheet ? { sheet: "m65-parka-v1" as const } : { sheet: null, title: request.slice(0, 60) || "제작 상담" }) };
  await writeFile(path.join(dir, "draft"), JSON.stringify(meta), { mode: 0o600 });
  await rename(path.join(dir, "draft"), path.join(dir, "thread.json"));
  return id;
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  if (!uuid.test(id)) return null;
  const dir = path.join(root(), id);
  try {
    const meta: Metadata = JSON.parse(await readFile(path.join(dir, "thread.json"), "utf8"));
    const files = await readdir(dir);
    const messages: StudioMessage[] = await Promise.all(files.filter(f => f.startsWith("msg-"))
      .map(async file => JSON.parse(await readFile(path.join(dir, file), "utf8"))));
    messages.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
    return { id, ...meta, messages, opened: files.includes("opened") };
  } catch (error) {
    if (hasCode(error, "ENOENT")) return null;
    throw error;
  }
}

export async function inbox() {
  let ids: string[];
  try { ids = await readdir(root()); }
  catch (error) { if (hasCode(error, "ENOENT")) return []; throw error; }
  const entries = await Promise.all(ids.filter(id => uuid.test(id)).map(getInquiry));
  const received = entries.filter((thread): thread is Inquiry => Boolean(thread?.messages.length));
  return received.sort((a, b) =>
    Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.messages[0].at - a.messages[0].at);
}

export async function appendMessage(id: string, key: string, author: Speaker, body: string, cards: FactoryCard[] = []) {
  const text = body.trim();
  if (!uuid.test(id) || !/^[\da-f]{32}$/.test(key) || !text || text.length > 2000) throw new Error("문의 내용을 확인해주세요.");
  const dir = path.join(root(), id);
  const message: StudioMessage = { id: key, author, text, ...(cards.length ? { cards } : {}), at: Date.now() };
  const staging = path.join(dir, randomUUID());
  await writeFile(staging, JSON.stringify(message), { mode: 0o600, flag: "wx" });
  try {
    // Publish a complete message exactly once, including on simultaneous sends and retries.
    await link(staging, path.join(dir, `msg-${author}-${key}`));
  } catch (error) {
    if (!hasCode(error, "EEXIST")) throw error;
  } finally { await unlink(staging); }
}

export async function markInquiryOpened(id: string) {
  if (!uuid.test(id)) throw new Error("잘못된 상담 번호입니다.");
  await writeFile(path.join(root(), id, "opened"), "", { mode: 0o600 });
}
