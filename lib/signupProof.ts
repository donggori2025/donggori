import { createSessionRecord, verifySessionToken, type SessionType } from "./session";
import type { NextResponse } from "next/server";

const SIGNUP_PROOF_TTL_SEC = 10 * 60;

export type SignupProof = {
  type: SessionType;
  email: string | null;
  externalId: string | null;
  provider: string | null;
};

export async function createSignupProof(input: SignupProof): Promise<string> {
  const { token } = await createSessionRecord({
    type: input.type,
    userEmail: input.email,
    externalId: input.externalId,
    provider: input.provider,
    isInitialized: false,
    ttlSec: SIGNUP_PROOF_TTL_SEC,
  });
  return token;
}

export async function readSignupProof(token?: string): Promise<SignupProof | null> {
  if (!token) return null;
  const { valid, data } = await verifySessionToken(token);
  if (!valid || !data || data.user_id || data.is_initialized) return null;
  return {
    type: data.type,
    email: data.user_email?.trim().toLowerCase() || null,
    externalId: data.external_id,
    provider: data.provider,
  };
}

export async function setVerificationProofCookie(
  response: NextResponse,
  name: "signup_proof" | "reset_proof",
  input: SignupProof,
): Promise<void> {
  response.cookies.set(name, await createSignupProof(input), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SIGNUP_PROOF_TTL_SEC,
  });
}
