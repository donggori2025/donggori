import { NextResponse } from 'next/server';
import { requestEmailOtp, type OtpPurpose } from '@/lib/emailOtp';

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: '이메일이 필요합니다.' }, { status: 400 });
    const p: OtpPurpose = purpose || 'signup';
    const result = await requestEmailOtp(email, p);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[ERROR] email request failed:', e);
    return NextResponse.json({ ok: false, error: e?.message || '인증번호 요청 실패' }, { status: 400 });
  }
}
