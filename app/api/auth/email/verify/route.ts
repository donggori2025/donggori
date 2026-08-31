import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailOtp, type OtpPurpose } from '@/lib/emailOtp';
import { readSignupProof, setVerificationProofCookie } from '@/lib/signupProof';

export async function POST(req: NextRequest) {
  try {
    const { email, code, purpose } = await req.json();
    if (!email || !code) return NextResponse.json({ ok: false, error: '이메일과 코드가 필요합니다.' }, { status: 400 });
    const p: OtpPurpose = purpose || 'signup';
    if (!['signup', 'login', 'reset'].includes(p)) {
      return NextResponse.json({ ok: false, error: '지원하지 않는 인증 목적입니다.' }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(code).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json({ ok: false, error: '이메일 또는 인증 코드 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    const result = await verifyEmailOtp(normalizedEmail, normalizedCode, p);
    const response = NextResponse.json(result);

    if (result.ok && p === 'signup') {
      const current = await readSignupProof(req.cookies.get('signup_proof')?.value);
      const proof = current?.type === 'sns'
        ? { ...current, email: normalizedEmail }
        : { type: 'local' as const, email: normalizedEmail, externalId: null, provider: null };
      await setVerificationProofCookie(response, 'signup_proof', proof);
    }

    if (result.ok && p === 'reset') {
      await setVerificationProofCookie(response, 'reset_proof', {
        type: 'local', email: normalizedEmail, externalId: null, provider: null,
      });
    }

    return response;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '인증 실패' }, { status: 400 });
  }
}
