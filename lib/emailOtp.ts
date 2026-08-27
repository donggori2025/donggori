import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import { sendEmail } from "./messaging";
import crypto from "crypto";

const supabaseServer =
  config.supabase.url &&
  config.supabase.serviceRoleKey &&
  config.supabase.url !== "your-supabase-url" &&
  config.supabase.url !== "your-supabase-url/" &&
  config.supabase.url.startsWith("http") &&
  config.supabase.serviceRoleKey.length > 10
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

export type OtpPurpose = "signup" | "login" | "reset";

const MAX_VERIFY_ATTEMPTS = 5;

export async function requestEmailOtp(email: string, purpose: OtpPurpose) {
  if (!supabaseServer) throw new Error("Supabase service key is missing");
  const code = generateCode(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data: recent } = await supabaseServer
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);

  if (recent && recent[0]) {
    const last = new Date(recent[0].created_at).getTime();
    if (Date.now() - last < 60 * 1000) {
      throw new Error("요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // email_otps 실제 컬럼만 사용 (verify_attempts 등은 마이그레이션 전 환경에 없음)
  const { error } = await supabaseServer.from("email_otps").insert([
    {
      email,
      code,
      purpose,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    },
  ]);
  if (error) {
    console.error("[ERROR] Supabase insert failed:", error);
    throw new Error(error.message);
  }

  const emailResult = await sendEmail(
    email,
    `[동고리] 인증번호 ${code} (5분 내 유효)`,
    `동고리 이메일 인증번호입니다.\n\n인증번호: ${code}\n\n이 인증번호는 5분 내에 유효합니다.\n\n감사합니다.`
  );

  if (emailResult.provider === "mock") {
    console.log(`[EMAIL OTP] 개발 Mock: ${email} / ${code}`);
    return { ok: true };
  }

  if (!emailResult.ok) {
    throw new Error(emailResult.message || "이메일 발송에 실패했습니다.");
  }

  return { ok: true };
}

export async function verifyEmailOtp(email: string, code: string, purpose: OtpPurpose) {
  if (!supabaseServer) throw new Error("Supabase service key is missing");

  const { data, error } = await supabaseServer
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const record = data?.[0];
  if (!record) throw new Error("인증 요청을 찾을 수 없습니다.");

  if (record.consumed_at) {
    throw new Error("이미 사용된 인증 코드입니다.");
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    throw new Error("인증 코드가 만료되었습니다.");
  }

  // verify_attempts 컬럼이 있으면 사용, 없으면 무시하고 검증만 진행
  const currentAttempts = Number(record.verify_attempts ?? 0);
  if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new Error("인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.");
  }

  const codeMatch =
    typeof record.code === "string" &&
    code.length === record.code.length &&
    crypto.timingSafeEqual(Buffer.from(code), Buffer.from(record.code));

  if (!codeMatch) {
    const nextAttempts = currentAttempts + 1;
    const { error: attemptError } = await supabaseServer
      .from("email_otps")
      .update({ verify_attempts: nextAttempts })
      .eq("id", record.id);
    // 컬럼이 없는 환경에서는 업데이트 실패를 무시한다.
    if (attemptError && !/verify_attempts|schema cache/i.test(attemptError.message)) {
      console.warn("[emailOtp] verify_attempts update skipped:", attemptError.message);
    }
    if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw new Error("인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.");
    }
    throw new Error("인증 코드가 올바르지 않습니다.");
  }

  await supabaseServer
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", record.id);

  return { ok: true };
}

function generateCode(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += crypto.randomInt(0, 10).toString();
  }
  return result;
}
