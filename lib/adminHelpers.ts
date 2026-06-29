import crypto from "crypto";

/** timingSafeEqual 길이 불일치 시 예외 없이 false 반환 */
export function safeTimingEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/** Blob 업로드 folder 경로 sanitize */
export function sanitizeBlobFolder(folder: string): string | null {
  const trimmed = folder.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.includes("..") || trimmed.startsWith(".")) return null;
  if (!/^[a-zA-Z0-9_\-/]+$/.test(trimmed)) return null;
  const segments = trimmed.split("/").filter(Boolean);
  if (segments.length === 0 || segments.length > 4) return null;
  return segments.join("/");
}

export function validateNoticeBody(body: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { ok: false, error: "제목은 필수입니다." };
  if (title.length > 200) return { ok: false, error: "제목은 200자 이하여야 합니다." };

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 50000) return { ok: false, error: "내용은 50,000자 이하여야 합니다." };

  const category = typeof body.category === "string" ? body.category : "일반";
  if (!["공지", "일반", "채용공고"].includes(category)) {
    return { ok: false, error: "유효하지 않은 카테고리입니다." };
  }

  const data: Record<string, unknown> = {
    title,
    content,
    category,
    start_at: body.start_at ?? null,
    end_at: body.end_at ?? null,
  };

  if (body.image_urls !== undefined) {
    if (!Array.isArray(body.image_urls)) return { ok: false, error: "image_urls 형식이 올바르지 않습니다." };
    data.image_urls = body.image_urls.filter((u) => typeof u === "string" && u.length > 0).slice(0, 10);
  }

  return { ok: true, data };
}

export function validatePopupBody(body: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() : "";

  if (!title && !content && !imageUrl) {
    return { ok: false, error: "제목, 내용, 이미지 중 하나 이상 필요합니다." };
  }
  if (title.length > 200) return { ok: false, error: "제목은 200자 이하여야 합니다." };
  if (content.length > 10000) return { ok: false, error: "내용은 10,000자 이하여야 합니다." };

  const linkUrl = typeof body.link_url === "string" ? body.link_url.trim() : "";
  if (linkUrl && !/^https?:\/\/.+/.test(linkUrl)) {
    return { ok: false, error: "링크 URL은 http:// 또는 https:// 로 시작해야 합니다." };
  }

  return {
    ok: true,
    data: {
      title: title || null,
      content: content || null,
      image_url: imageUrl || null,
      link_url: linkUrl || null,
      start_at: body.start_at ?? null,
      end_at: body.end_at ?? null,
    },
  };
}
