import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from '@/lib/config';
import { createSessionRecord } from '@/lib/session';
import { SESSION_DURATIONS } from '@/lib/sessionConfig';

export async function POST(req: NextRequest) {
  try {
    const { email, password, loginMethod } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return NextResponse.json({ error: '이메일 필요' }, { status: 400 });

    // 환경변수 유효성 검사
    if (!config.supabase.url || !config.supabase.serviceRoleKey || 
        config.supabase.url === 'your-supabase-url' || 
        config.supabase.url === 'your-supabase-url/' ||
        !config.supabase.url.startsWith('http') ||
        config.supabase.serviceRoleKey.length <= 10) {
      return NextResponse.json({ error: '데이터베이스 연결 오류' }, { status: 500 });
    }

    let supabase;
    try {
      supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
    } catch (error) {
      console.error('Supabase 클라이언트 생성 실패:', error);
      return NextResponse.json({ error: '데이터베이스 연결 오류' }, { status: 500 });
    }
    
    // 이메일 인증 로그인인 경우
    if (loginMethod === 'email_otp') {
      const { data: user, error } = await supabase.from('users').select('id, email').eq('email', normalizedEmail).maybeSingle();
      if (error || !user) return NextResponse.json({ error: '로그인에 실패했습니다.' }, { status: 401 });

      const { token } = await createSessionRecord({ 
        type: 'local', 
        userId: user.id, 
        userEmail: user.email, 
        isInitialized: true,
        ttlSec: SESSION_DURATIONS.USER
      });
      const res = NextResponse.json({ success: true });
      res.cookies.set('access_token', token, { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production', 
        path: '/',
        maxAge: SESSION_DURATIONS.USER 
      });
      return res;
    }

    // 비밀번호 로그인인 경우
    if (!password) return NextResponse.json({ error: '비밀번호 필요' }, { status: 400 });

    const { data: user, error } = await supabase.from('users').select('id, email, password, signupMethod, name, phoneNumber, profileImage').eq('email', normalizedEmail).maybeSingle();
    if (error || !user) return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    
    // 소셜 로그인 사용자인지 확인
    if (user.signupMethod && ['kakao', 'naver', 'google'].includes(user.signupMethod)) {
      const providerName = user.signupMethod === 'kakao' ? '카카오' : user.signupMethod === 'naver' ? '네이버' : '소셜';
      return NextResponse.json({ 
        error: `${providerName}로 가입된 계정입니다. 소셜 로그인을 이용해주세요.` 
      }, { status: 400 });
    }
    
    // 비밀번호가 없는 경우 (소셜 로그인 사용자)
    if (!user.password) {
      return NextResponse.json({ 
        error: '소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요.' 
      }, { status: 400 });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

    const { token } = await createSessionRecord({ 
      type: 'local', 
      userId: user.id, 
      userEmail: user.email, 
      isInitialized: true,
      ttlSec: SESSION_DURATIONS.USER
    });
    const res = NextResponse.json({ 
      success: true,
      user: { id: user.id, email: user.email, name: user.name || '', phoneNumber: user.phoneNumber || '' }
    });
    res.cookies.set('access_token', token, { 
      httpOnly: true, 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      path: '/',
      maxAge: SESSION_DURATIONS.USER 
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 });
  }
}


