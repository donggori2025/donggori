import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';
import { sendAlimtalk, sendSMS } from '@/lib/messaging';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get('debug') === '1';
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
    // 우선순위: match_requests.factory_phone -> donggori.phone_num -> match_requests.contact
    let factoryPhone = orderData.factory_phone || orderData.factory_contact || null;
    if (!factoryPhone) {
      const { data: factoryRow } = await supabase
        .from('donggori')
        .select('phone_num, phone_number, contact')
        .eq('id', orderData.factory_id)
        .maybeSingle();
      factoryPhone = (factoryRow?.phone_num || factoryRow?.phone_number || factoryRow?.contact || orderData.contact || '').toString();
    }
    const designerName = orderData.user_name || '디자이너';
    const designerPhone = orderData.contact || orderData.user_phone || '';
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/my-page/requests?id=${workOrderId}`;

    // 연락처 유효성(숫자 9자리 이상) 확인
    const digits = String(factoryPhone).replace(/[^0-9]/g, '');
    if (!digits || digits.length < 9) {
      // 실패 로그 남김(조회 가능하도록)
      try {
        await supabase.from('message_logs').insert([
          {
            work_order_id: String(workOrderId),
            channel: 'ALIMTALK',
            to: String(factoryPhone || ''),
            payload: { reason: 'NO_VALID_FACTORY_PHONE' },
            status: 'FAILED',
            error: '공장 연락처가 없거나 유효하지 않습니다.',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {}
      return NextResponse.json({ ok: false, error: '공장 연락처가 없거나 유효하지 않습니다.' }, { status: 400 });
    }

    // 상세설명/요청사항 추출
    let desc = '';
    let details = '';
    try {
      const add = typeof orderData.additional_info === 'string' ? JSON.parse(orderData.additional_info) : (orderData.additional_info || {});
      // 기존 description은 기본정보로 사용, 상세설명은 additional_info.description, 상세요청사항은 additional_info.request 혹은 notes 키를 우선 사용
      desc = (add?.description || orderData.description || '').toString().slice(0, 300);
      details = (add?.request || add?.requests || add?.notes || '').toString().slice(0, 300);
    } catch {}

    const variables = {
      id: String(workOrderId),
      name: String(designerName),
      phone: String(designerPhone),
      shortUrl,
      desc,
      details,
    };

    // 1차 알림톡, 실패 시 SMS 폴백
    const a = await sendAlimtalk(factoryPhone, 'DG_REQUEST', variables);
    let finalChannel: 'ALIMTALK' | 'SMS' = 'ALIMTALK';
    if (!a.ok) {
      await sendSMS(factoryPhone, `[동고리 의뢰] 의뢰ID ${variables.id}, 디자이너 ${variables.name}(${variables.phone}) 확인: ${variables.shortUrl}`);
      finalChannel = 'SMS';
    }

    // 디버깅/조회 편의를 위한 추가 로그 (work_order_id 포함)
    try {
      await supabase.from('message_logs').insert([
        {
          work_order_id: String(workOrderId),
          channel: finalChannel,
          to: String(factoryPhone),
          payload: { templateCode: 'DG_REQUEST', variables },
          status: 'SENT',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      // 로깅 실패는 기능 흐름에 영향 주지 않음
      console.warn('message_logs insert failed (non-blocking):', e);
    }

    // 상태 업데이트
    await supabase
      .from('match_requests')
      .update({ status: 'SENT', updated_at: new Date().toISOString() })
      .eq('id', workOrderId);

    return NextResponse.json({ ok: true, channel: a.ok ? 'ALIMTALK' : 'SMS', ...(debug ? { variables, factoryPhone } : {}) });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'failed' }, { status: 500 });
  }
}


