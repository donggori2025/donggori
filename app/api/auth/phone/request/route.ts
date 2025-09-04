import { NextResponse } from 'next/server';
import { requestPhoneOtp, type OtpPurpose } from '@/lib/otp';

function toE164KR(input: string): string {
  const digits = String(input || '').replace(/[^0-9]/g, '');
  if (!digits) throw new Error('전화번호가 비어 있습니다.');
  // 이미 82로 시작하면 그대로 + 접두
  if (digits.startsWith('82')) return `+${digits}`;
  // 국내 0으로 시작(예: 010-xxxx-xxxx) → +82로 변환(선행 0 제거)
  if (digits.startsWith('0')) return `+82${digits.slice(1)}`;
  // 그 외에는 기본적으로 +82 접두 (안전장치)
  return `+82${digits}`;
}

export async function POST(req: Request) {
  try {
    const { phone, purpose } = await req.json();
    if (!phone) return NextResponse.json({ ok: false, error: '전화번호가 필요합니다.' }, { status: 400 });
    const p: OtpPurpose = purpose || 'signup';
    const phoneE164 = toE164KR(phone);
    const result = await requestPhoneOtp(phoneE164, p);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '인증번호 요청 실패' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requestPhoneOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone, purpose } = await req.json();
    if (!phone) return NextResponse.json({ error: 'phone이 필요합니다.' }, { status: 400 });
    const clean = normalizePhone(phone);
    await requestPhoneOtp(clean, purpose || 'signup');
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'failed' }, { status: 400 });
  }
}

function normalizePhone(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.startsWith('82')) return `+${digits}`;
  if (digits.startsWith('0')) return `+82${digits.slice(1)}`;
  return `+82${digits}`;
}


