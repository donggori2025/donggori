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

// Best-effort single-instance throttle. It does not coordinate Vercel instances; see docs/hardening/platform-and-seo.md.
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

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function imageUploadExtension(type: string): string | null {
  return ALLOWED_IMAGE_TYPES.has(type) ? IMAGE_EXTENSIONS[type] : null;
}

type FactoryValue = string | number | null | string[];
type FactoryValidation = { ok: true; data: Record<string, FactoryValue> } | { ok: false; error: string };

const FACTORY_FIELDS = new Set([
  "company_name", "name", "address", "business_type", "phone_number", "contact", "contact_name", "email",
  "admin_district", "intro", "factory_type", "main_fabrics", "distribution", "delivery", "equipment",
  "sewing_machines", "pattern_machines", "special_machines", "processes", "top_items_upper", "top_items_lower",
  "top_items_outer", "top_items_dress_skirt", "top_items_bag", "top_items_fashion_accessory", "top_items_underwear",
  "top_items_sports_leisure", "top_items_pet", "items", "kakao_url", "image", "images", "lat", "lng", "moq",
  "minOrder", "monthly_capacity", "monthlyCapacity", "established_year", "establishedYear",
]);
const FACTORY_NUMBERS = new Set(["lat", "lng", "moq", "minOrder", "monthly_capacity", "monthlyCapacity", "established_year", "establishedYear"]);

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isPublicImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !/[\r\n]/.test(value)) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates the admin-only factory write boundary before it reaches Supabase. */
export function validateFactoryPatch(input: unknown, requireIdentity = false): FactoryValidation {
  const body = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const data: Record<string, FactoryValue> = {};

  for (const [key, raw] of Object.entries(body)) {
    if (!FACTORY_FIELDS.has(key) || raw === undefined) continue;
    if (key === "images") {
      if (!Array.isArray(raw) || raw.length > 12 || raw.some((value) => typeof value !== "string" || value.length > 2000 || !isPublicImageUrl(value))) {
        return { ok: false, error: "이미지는 최대 12개의 HTTPS 또는 사이트 내부 URL만 허용됩니다." };
      }
      data[key] = raw;
      continue;
    }
    if (FACTORY_NUMBERS.has(key)) {
      const value = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(value)) return { ok: false, error: `${key} 값이 올바르지 않습니다.` };
      if (key === "lat" && (value < -90 || value > 90)) return { ok: false, error: "위도 범위가 올바르지 않습니다." };
      if (key === "lng" && (value < -180 || value > 180)) return { ok: false, error: "경도 범위가 올바르지 않습니다." };
      if ((key === "established_year" || key === "establishedYear") && (value < 1800 || value > new Date().getFullYear() + 1)) return { ok: false, error: "설립연도 범위가 올바르지 않습니다." };
      if (!key.startsWith("lat") && !key.startsWith("lng") && value < 0) return { ok: false, error: `${key} 값은 0 이상이어야 합니다.` };
      data[key] = value;
      continue;
    }
    if (raw === null) {
      data[key] = null;
      continue;
    }
    if (typeof raw !== "string") return { ok: false, error: `${key} 값 형식이 올바르지 않습니다.` };
    const value = raw.trim();
    const maxLength = key === "intro" ? 5000 : key === "address" ? 300 : key === "email" ? 254 : key === "phone_number" || key === "contact" ? 40 : 1000;
    if (value.length > maxLength) return { ok: false, error: `${key} 값이 너무 깁니다.` };
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, error: "이메일 형식이 올바르지 않습니다." };
    if ((key === "phone_number" || key === "contact") && value && !/^[0-9+()\-\s]{7,40}$/.test(value)) return { ok: false, error: "전화번호 형식이 올바르지 않습니다." };
    if (key === "kakao_url" && value && !isHttpUrl(value)) return { ok: false, error: `${key} URL 형식이 올바르지 않습니다.` };
    if (key === "image" && value && !isPublicImageUrl(value)) return { ok: false, error: "이미지는 HTTPS 또는 사이트 내부 URL만 허용됩니다." };
    data[key] = value;
  }

  if (("lat" in data) !== ("lng" in data)) return { ok: false, error: "위도와 경도는 함께 입력해야 합니다." };
  const hasName = (typeof data.company_name === "string" && data.company_name.length > 0)
    || (typeof data.name === "string" && data.name.length > 0);
  if (requireIdentity && !hasName) {
    return { ok: false, error: "업장명은 필수입니다." };
  }
  if (requireIdentity && !(typeof data.address === "string" && data.address)) return { ok: false, error: "주소는 필수입니다." };
  if (Object.keys(data).length === 0) return { ok: false, error: "수정할 데이터가 없습니다." };
  return { ok: true, data };
}

export function validateNoticeBody(body: Record<string, unknown>, defaultActive = true): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { ok: false, error: "제목은 필수입니다." };
  if (title.length > 200) return { ok: false, error: "제목은 200자 이하여야 합니다." };

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 50000) return { ok: false, error: "내용은 50,000자 이하여야 합니다." };

  const category = typeof body.category === "string" ? body.category : "일반";
  if (!["공지", "일반", "채용공고"].includes(category)) {
    return { ok: false, error: "유효하지 않은 카테고리입니다." };
  }

  const startAt = typeof body.start_at === "string" && body.start_at.trim() ? body.start_at.trim() : null;
  const endAt = typeof body.end_at === "string" && body.end_at.trim() ? body.end_at.trim() : null;
  if ((startAt && Number.isNaN(Date.parse(startAt))) || (endAt && Number.isNaN(Date.parse(endAt)))) {
    return { ok: false, error: "노출 기간 형식이 올바르지 않습니다." };
  }
  if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
    return { ok: false, error: "노출 종료일은 시작일 이후여야 합니다." };
  }
  if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
    return { ok: false, error: "노출 여부 형식이 올바르지 않습니다." };
  }

  const data: Record<string, unknown> = {
    title,
    content,
    category,
    start_at: startAt,
    end_at: endAt,
  };
  if (body.is_active !== undefined) data.is_active = body.is_active;
  else if (defaultActive) data.is_active = true;

  if (body.image_urls !== undefined) {
    if (!Array.isArray(body.image_urls)) return { ok: false, error: "image_urls 형식이 올바르지 않습니다." };
    if (body.image_urls.length > 10 || body.image_urls.some((url) => typeof url !== "string" || url.length > 2000 || !isPublicImageUrl(url))) {
      return { ok: false, error: "공지 이미지는 최대 10개의 HTTPS 또는 사이트 내부 URL만 허용됩니다." };
    }
    data.image_urls = body.image_urls;
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
  if (imageUrl && (imageUrl.length > 2000 || !isPublicImageUrl(imageUrl))) {
    return { ok: false, error: "이미지는 HTTPS 또는 사이트 내부 URL만 허용됩니다." };
  }

  const linkUrl = typeof body.link_url === "string" ? body.link_url.trim() : "";
  if (linkUrl && !isHttpUrl(linkUrl)) {
    return { ok: false, error: "링크 URL은 http:// 또는 https:// 로 시작해야 합니다." };
  }

  const linkUrlMobile = typeof body.link_url_mobile === "string" ? body.link_url_mobile.trim() : "";
  if (linkUrlMobile && !isHttpUrl(linkUrlMobile)) {
    return { ok: false, error: "모바일 링크 URL은 http:// 또는 https:// 로 시작해야 합니다." };
  }

  const startAt = typeof body.start_at === "string" && body.start_at.trim() ? body.start_at.trim() : null;
  const endAt = typeof body.end_at === "string" && body.end_at.trim() ? body.end_at.trim() : null;
  if ((startAt && Number.isNaN(Date.parse(startAt))) || (endAt && Number.isNaN(Date.parse(endAt)))) {
    return { ok: false, error: "노출 기간 형식이 올바르지 않습니다." };
  }
  if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
    return { ok: false, error: "노출 종료일은 시작일 이후여야 합니다." };
  }
  if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
    return { ok: false, error: "노출 여부 형식이 올바르지 않습니다." };
  }

  const data: Record<string, unknown> = {
    title: title || (imageUrl ? "팝업" : "제목 없음"),
    content: content || null,
    image_url: imageUrl || null,
    link_url: linkUrl || null,
    link_url_mobile: linkUrlMobile || null,
    start_at: startAt,
    end_at: endAt,
  };

  if (body.is_active !== undefined) {
    data.is_active = body.is_active;
  }

  if (body.sort_order !== undefined && body.sort_order !== null && body.sort_order !== "") {
    const order = Number(body.sort_order);
    if (!Number.isInteger(order) || order < -10000 || order > 10000) {
      return { ok: false, error: "정렬 순서는 -10000~10000 정수여야 합니다." };
    }
    data.sort_order = order;
  }

  return { ok: true, data };
}
