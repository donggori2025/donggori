import { NextResponse } from 'next/server';
import { verifyEmailOtp, type OtpPurpose } from '@/lib/emailOtp';

export async function POST(req: Request) {
  try {
    const { email, code, purpose } = await req.json();
    if (!email || !code) return NextResponse.json({ ok: false, error: '이메일과 코드가 필요합니다.' }, { status: 400 });
    const p: OtpPurpose = purpose || 'signup';
    const result = await verifyEmailOtp(email, code, p);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '인증 실패' }, { status: 400 });
  }
}
