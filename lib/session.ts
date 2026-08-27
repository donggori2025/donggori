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

function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.FACTORY_SESSION_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 또는 ADMIN_SESSION_SECRET 환경변수가 필요합니다.");
  }

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
 * HMAC 서명 토큰을 발급하고 sessions 테이블에 저장해 서버에서 폐기할 수 있게 한다.
 * 개발 환경만 테이블 미구성 상태를 허용한다.
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
    if (error) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("로그인 세션을 저장하지 못했습니다.");
      }
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
    if (supabaseServer) {
      const { data: stored, error } = await supabaseServer
        .from("sessions")
        .select("id")
        .eq("id", token)
        .maybeSingle();
      if (error || !stored) {
        if (process.env.NODE_ENV === "production" || !error) return { valid: false };
        console.warn("[session] sessions lookup skipped:", error.message);
      }
    }
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

export async function revokeSessionToken(token: string): Promise<void> {
  if (!supabaseServer || !token) return;
  const { error } = await supabaseServer.from("sessions").delete().eq("id", token);
  if (error && process.env.NODE_ENV === "production") {
    throw new Error("로그인 세션을 폐기하지 못했습니다.");
  }
}
