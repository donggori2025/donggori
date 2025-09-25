import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase 환경 변수가 누락되었습니다.' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const { factory_id, rating, user_answers, timestamp } = body;

    // 피드백 데이터 저장
    const { data, error } = await supabase
      .from('matching_feedback')
      .insert({
        factory_id,
        rating,
        user_answers: JSON.stringify(user_answers),
        created_at: timestamp || new Date().toISOString()
      });

    if (error) {
      console.error('피드백 저장 실패:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 저장되었습니다.' 
    });

  } catch (error: any) {
    console.error('피드백 API 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase 환경 변수가 누락되었습니다.' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get('factory_id');

    let query = supabase.from('matching_feedback').select('*');
    
    if (factoryId) {
      query = query.eq('factory_id', factoryId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('피드백 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
