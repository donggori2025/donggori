import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from '@/lib/config';
import { createSessionRecord } from '@/lib/session';
import { SESSION_DURATIONS } from '@/lib/sessionConfig';

export async function POST(req: NextRequest) {
  try {
    const { email, password, loginMethod } = await req.json();
    if (!email) return NextResponse.json({ error: '이메일 필요' }, { status: 400 });

    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
    
    // 이메일 인증 로그인인 경우
    if (loginMethod === 'email_otp') {
      const { data: user, error } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
      if (error || !user) return NextResponse.json({ error: '존재하지 않는 계정' }, { status: 404 });

      const { token } = await createSessionRecord({ 
        type: 'local', 
        userId: user.id, 
        userEmail: user.email, 
        isInitialized: true,
        ttlSec: SESSION_DURATIONS.USER
      });
      const res = NextResponse.json({ success: true, accessToken: token });
      res.cookies.set('access_token', token, { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: SESSION_DURATIONS.USER 
      });
      return res;
    }

    // 비밀번호 로그인인 경우
    if (!password) return NextResponse.json({ error: '비밀번호 필요' }, { status: 400 });

    const { data: user, error } = await supabase.from('users').select('id, email, password').eq('email', email).maybeSingle();
    if (error || !user?.password) return NextResponse.json({ error: '존재하지 않는 계정' }, { status: 404 });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: '비밀번호 불일치' }, { status: 401 });

    const { token } = await createSessionRecord({ 
      type: 'local', 
      userId: user.id, 
      userEmail: user.email, 
      isInitialized: true,
      ttlSec: SESSION_DURATIONS.USER
    });
    const res = NextResponse.json({ success: true, accessToken: token });
    res.cookies.set('access_token', token, { 
      httpOnly: true, 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: SESSION_DURATIONS.USER 
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 });
  }
}


