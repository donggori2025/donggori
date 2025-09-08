import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { factoryId, updateData } = body;

    if (!factoryId || !updateData) {
      return NextResponse.json(
        { success: false, error: 'factoryId와 updateData가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('API: 공장 정보 업데이트 시작', { factoryId, updateData });

    // Service Role로 업데이트
    const { data, error } = await supabaseService
      .from('donggori')
      .update(updateData)
      .eq('id', parseInt(factoryId))
      .select()
      .single();

    if (error) {
      console.error('API: 공장 정보 업데이트 오류:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('API: 공장 정보 업데이트 성공:', data);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('API: 예상치 못한 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
