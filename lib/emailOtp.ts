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
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data: recent, error: recentError } = await supabaseServer
    .from("email_otps")
    .select("created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  if (recentError) {
    throw new Error("인증번호 요청 이력을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  if (recent && recent[0]) {
    const last = new Date(recent[0].created_at).getTime();
    if (Date.now() - last < 60 * 1000) {
      throw new Error("요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  const { data: inserted, error } = await supabaseServer.from("email_otps").insert([
    {
      email,
      code: codeHash,
      purpose,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    },
  ]).select("id").single();
  if (error) {
    console.error("[email-otp] insert failed", { code: error.code });
    throw new Error("인증번호 요청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  const emailResult = await sendEmail(
    email,
    "[동고리] 이메일 인증번호 안내",
    `동고리 이메일 인증번호입니다.\n\n인증번호: ${code}\n\n이 인증번호는 5분 내에 유효합니다.\n\n감사합니다.`
  );

  if (!emailResult.ok) {
    if (inserted?.id) {
      await supabaseServer.from("email_otps").delete().eq("id", inserted.id);
    }
    throw new Error(emailResult.message || "이메일 발송에 실패했습니다.");
  }

  return { ok: true };
}

export async function verifyEmailOtp(email: string, code: string, purpose: OtpPurpose) {
  if (!supabaseServer) throw new Error("Supabase service key is missing");

  const { data, error } = await supabaseServer
    .from("email_otps")
    .select("id,code,expires_at,consumed_at,verify_attempts")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error("인증 요청을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
  const record = data?.[0];
  if (!record) throw new Error("인증 요청을 찾을 수 없습니다.");

  if (record.consumed_at) {
    throw new Error("이미 사용된 인증 코드입니다.");
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    throw new Error("인증 코드가 만료되었습니다.");
  }

  // Brute-force protection is mandatory: a partially migrated DB must reject
  // verification instead of silently allowing unlimited guesses.
  if (!Number.isInteger(record.verify_attempts) || record.verify_attempts < 0) {
    throw new Error("인증 보안 설정이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
  }
  const currentAttempts = record.verify_attempts;
  if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
    throw new Error("인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.");
  }

  const submittedHash = hashOtp(code);
  const codeMatch =
    typeof record.code === "string" &&
    submittedHash.length === record.code.length &&
    crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(record.code));

  if (!codeMatch) {
    const nextAttempts = currentAttempts + 1;
    const { data: attempt, error: attemptError } = await supabaseServer
      .from("email_otps")
      .update({ verify_attempts: nextAttempts })
      .eq("id", record.id)
      .eq("verify_attempts", currentAttempts)
      .select("id")
      .maybeSingle();
    if (attemptError || !attempt) {
      throw new Error("인증 시도 기록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
    if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw new Error("인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.");
    }
    throw new Error("인증 코드가 올바르지 않습니다.");
  }

  const { data: consumed, error: consumeError } = await supabaseServer
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", record.id)
    .is("consumed_at", null)
    .select("id")
    .maybeSingle();
  if (consumeError || !consumed) {
    throw new Error("인증 코드를 사용 처리하지 못했습니다. 새로운 코드를 요청해주세요.");
  }

  return { ok: true };
}

function generateCode(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += crypto.randomInt(0, 10).toString();
  }
  return result;
}

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
