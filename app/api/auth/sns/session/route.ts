import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { createSessionRecord } from '@/lib/session';

// SNS 로그인 이후(카카오/네이버/구글 콜백 시점 또는 가입 완료 시점)에 호출해
// snsAccessToken 과 isInitialized 를 발급하는 엔드포인트
export async function POST(req: NextRequest) {
  try {
    const { email, externalId, provider, isInitialized } = await req.json();
    if (!email && !externalId) return NextResponse.json({ error: 'email 또는 externalId 필요' }, { status: 400 });

    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
    let user: any = null;
    if (email) {
      const u = await supabase.from('users').select('id, email, phoneNumber').eq('email', email).maybeSingle();
      user = u.data;
    }
    if (!user && externalId && provider) {
      const u = await supabase.from('users').select('id, email, phoneNumber').eq('externalId', externalId).eq('signupMethod', provider).maybeSingle();
      user = u.data;
    }

    const init = !!isInitialized || !!user?.phoneNumber; // 전화번호 존재 시 초기화된 것으로 간주
    const { token } = await createSessionRecord({
      type: 'sns',
      userId: user?.id ?? null,
      userEmail: user?.email ?? email ?? null,
      externalId: externalId ?? null,
      provider: provider ?? null,
      isInitialized: init,
    });

    const res = NextResponse.json({ success: true, snsAccessToken: token, isInitialized: init });
    res.cookies.set('sns_access_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 });
  }
}


