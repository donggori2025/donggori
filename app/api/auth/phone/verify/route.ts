import { NextResponse } from 'next/server';
import { verifyPhoneOtp, type OtpPurpose } from '@/lib/otp';

function toE164KR(input: string): string {
  const digits = String(input || '').replace(/[^0-9]/g, '');
  if (!digits) throw new Error('전화번호가 비어 있습니다.');
  if (digits.startsWith('82')) return `+${digits}`;
  if (digits.startsWith('0')) return `+82${digits.slice(1)}`;
  return `+82${digits}`;
}

export async function POST(req: Request) {
  try {
    const { phone, code, purpose } = await req.json();
    if (!phone || !code) return NextResponse.json({ ok: false, error: '전화번호와 코드가 필요합니다.' }, { status: 400 });
    const p: OtpPurpose = purpose || 'signup';
    const phoneE164 = toE164KR(phone);
    const result = await verifyPhoneOtp(phoneE164, code, p);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '인증 실패' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyPhoneOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone, code, purpose } = await req.json();
    if (!phone || !code) return NextResponse.json({ error: 'phone, code가 필요합니다.' }, { status: 400 });
    const clean = normalizePhone(phone);
    await verifyPhoneOtp(clean, code, purpose || 'signup');
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


