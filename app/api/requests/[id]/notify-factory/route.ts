import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { sendAlimtalk, sendSMS } from '@/lib/messaging';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workOrderId = params.id;
    if (!workOrderId) return NextResponse.json({ ok: false, error: 'id가 필요합니다.' }, { status: 400 });

    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
    const { data: orderData, error } = await supabase
      .from('match_requests')
      .select('*')
      .eq('id', workOrderId)
      .single();
    if (error || !orderData) {
      return NextResponse.json({ ok: false, error: error?.message || '의뢰를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 공장 연락처, 디자이너 정보 결정
    const factoryPhone = orderData.contact || orderData.factory_phone || orderData.factory_contact || null;
    const designerName = orderData.user_name || '디자이너';
    const designerPhone = orderData.contact || orderData.user_phone || '';
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/my-page/requests?id=${workOrderId}`;

    if (!factoryPhone) {
      return NextResponse.json({ ok: false, error: '공장 연락처가 없습니다.' }, { status: 400 });
    }

    const variables = {
      id: String(workOrderId),
      name: String(designerName),
      phone: String(designerPhone),
      shortUrl,
    };

    // 1차 알림톡, 실패 시 SMS 폴백
    const a = await sendAlimtalk(factoryPhone, 'DG_REQUEST', variables);
    if (!a.ok) {
      await sendSMS(factoryPhone, `[동고리 의뢰] 의뢰ID ${variables.id}, 디자이너 ${variables.name}(${variables.phone}) 확인: ${variables.shortUrl}`);
    }

    // 상태 업데이트
    await supabase
      .from('match_requests')
      .update({ status: 'SENT', updated_at: new Date().toISOString() })
      .eq('id', workOrderId);

    return NextResponse.json({ ok: true, channel: a.ok ? 'ALIMTALK' : 'SMS' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'failed' }, { status: 500 });
  }
}


