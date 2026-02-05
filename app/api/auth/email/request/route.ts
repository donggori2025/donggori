import { NextResponse } from 'next/server';
import { requestEmailOtp, type OtpPurpose } from '@/lib/emailOtp';

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();
    
    // 이메일 검증
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: '이메일이 필요합니다.' }, { status: 400 });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ ok: false, error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
    }
    
    const p: OtpPurpose = purpose || 'signup';
    const result = await requestEmailOtp(normalizedEmail, p);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[ERROR] email request failed:', e);
    const errorMessage = e?.message || '인증번호 요청 실패';
    
    // Supabase 관련 오류인 경우 더 명확한 메시지 제공
    if (errorMessage.includes('Supabase') || errorMessage.includes('service key')) {
      return NextResponse.json({ 
        ok: false, 
        error: '서버 설정 오류가 발생했습니다. 관리자에게 문의해주세요.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }
}
