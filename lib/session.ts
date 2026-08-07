import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

export type SessionType = "local" | "sns";

type SessionPayload = {
  type: SessionType;
  user_id: string | null;
  user_email: string | null;
  external_id: string | null;
  provider: string | null;
  is_initialized: boolean;
  expires_at: number;
  issued_at: number;
};

const supabaseServer =
  config.supabase.url && config.supabase.serviceRoleKey
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

let warnedMissingSessionSecret = false;

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.FACTORY_SESSION_SECRET ||
    process.env.SESSION_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production" && !warnedMissingSessionSecret) {
    warnedMissingSessionSecret = true;
    console.error(
      "[SECURITY] ADMIN_SESSION_SECRET 환경변수가 없습니다. 서버 재시작 시 로그인 세션이 무효화됩니다."
    );
  }

  // 개발/비상용. 프로덕션에서는 ADMIN_SESSION_SECRET 을 반드시 설정한다.
  return "donggori-dev-session-secret";
}

function signPayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("hex");
  return `v1.${data}.${sig}`;
}

function verifySignedToken(token: string): SessionPayload | null {
  try {
    if (!token.startsWith("v1.")) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, data, sig] = parts;
    const expected = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("hex");
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.expires_at || payload.expires_at < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * 로그인 세션 발급.
 * sessions 테이블이 없어도 HMAC 서명 토큰으로 동작한다.
 * 테이블이 있으면 감사/폐기용으로 best-effort INSERT 한다.
 */
export async function createSessionRecord(input: {
  type: SessionType;
  userId?: string | null;
  userEmail?: string | null;
  externalId?: string | null;
  provider?: string | null;
  isInitialized?: boolean;
  ttlSec?: number;
}): Promise<{ token: string }> {
  const now = Date.now();
  const ttlMs = (input.ttlSec ?? 60 * 60 * 24 * 7) * 1000;
  const payload: SessionPayload = {
    type: input.type,
    user_id: input.userId ?? null,
    user_email: input.userEmail ?? null,
    external_id: input.externalId ?? null,
    provider: input.provider ?? null,
    is_initialized: !!input.isInitialized,
    expires_at: now + ttlMs,
    issued_at: now,
  };

  const token = signPayload(payload);

  if (supabaseServer) {
    const { error } = await supabaseServer.from("sessions").insert([
      {
        id: token,
        type: payload.type,
        user_id: payload.user_id,
        user_email: payload.user_email,
        external_id: payload.external_id,
        provider: payload.provider,
        is_initialized: payload.is_initialized,
        expires_at: new Date(payload.expires_at).toISOString(),
        created_at: new Date(now).toISOString(),
      },
    ]);
    // 테이블 미존재 등으로 실패해도 로그인 자체는 서명 토큰으로 유지
    if (error) {
      console.warn("[session] sessions INSERT skipped:", error.message);
    }
  }

  return { token };
}

export async function verifySessionToken(token: string): Promise<{
  valid: boolean;
  data?: {
    user_id: string | null;
    user_email: string | null;
    external_id: string | null;
    provider: string | null;
    is_initialized: boolean;
    expires_at: string;
    type: SessionType;
  };
}> {
  const signed = verifySignedToken(token);
  if (signed) {
    return {
      valid: true,
      data: {
        type: signed.type,
        user_id: signed.user_id,
        user_email: signed.user_email,
        external_id: signed.external_id,
        provider: signed.provider,
        is_initialized: signed.is_initialized,
        expires_at: new Date(signed.expires_at).toISOString(),
      },
    };
  }

  // 구형 UUID 토큰 (sessions 테이블에만 있던 경우) 호환
  if (!supabaseServer) return { valid: false };
  try {
    const { data, error } = await supabaseServer
      .from("sessions")
      .select("*")
      .eq("id", token)
      .limit(1)
      .maybeSingle();
    if (error || !data) return { valid: false };
    if (data.expires_at && Date.parse(data.expires_at) < Date.now()) {
      return { valid: false };
    }
    return { valid: true, data };
  } catch {
    return { valid: false };
  }
}
