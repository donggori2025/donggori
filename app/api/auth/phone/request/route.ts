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


