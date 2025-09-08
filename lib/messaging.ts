import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export type MessageChannel = 'ALIMTALK' | 'SMS';

export interface SendOptions {
  channel?: MessageChannel;
  templateCode?: string;
  variables?: Record<string, string>;
}

const supabaseServer = config.supabase.url && config.supabase.serviceRoleKey
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } })
  : null;

async function logMessage(params: {
  workOrderId?: string;
  channel: MessageChannel;
  to: string;
  payload: any;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  error?: string;
}) {
  try {
    if (!supabaseServer) return;
    await supabaseServer.from('message_logs').insert([
      {
        work_order_id: params.workOrderId ?? null,
        channel: params.channel,
        to: params.to,
        payload: params.payload,
        status: params.status,
        error: params.error ?? null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    console.warn('Message log insert failed:', e);
  }
}

function renderAlimtalkContent(templateCode: string, variables: Record<string, string>) {
  // 템플릿 별 메시지 구성. 실제 운영에서는 템플릿 승인된 문구와 변수만 사용해야 함
  if (templateCode === 'DG_REQUEST') {
    const id = variables.id || '';
    const name = variables.name || '';
    const phone = variables.phone || '';
    const shortUrl = variables.shortUrl || '';
    const desc = variables.desc ? `\n\n상세설명\n- ${variables.desc}` : '';
    const details = variables.details ? `\n\n상세 요청사항\n- ${variables.details}` : '';
    return {
      title: '동고리 의뢰 도착',
      message: `의뢰가 접수되었습니다.\n의뢰ID: ${id}\n디자이너: ${name} (${phone})${desc}${details}\n\n아래 버튼을 눌러 상세를 확인하세요.`,
      buttons: shortUrl ? [{ type: 'WL', name: '의뢰 상세보기', linkMobile: shortUrl, linkPc: shortUrl }] : undefined,
    } as const;
  }
  return { title: '알림', message: '새 알림이 도착했습니다.' } as const;
}

async function sendAlimtalkViaNaverSENS(toE164: string, templateCode: string, variables: Record<string, string>) {
  const accessKey = process.env.NCP_SENS_ACCESS_KEY;
  const secretKey = process.env.NCP_SENS_SECRET_KEY;
  const serviceId = process.env.NCP_BIZMSG_SERVICE_ID || process.env.NCP_SENS_SERVICE_ID;
  const senderKey = process.env.BIZMSG_SENDER_KEY; // 카카오 채널(발신 프로필) senderKey

  if (!accessKey || !secretKey || !serviceId || !senderKey) {
    throw new Error('알림톡 환경 변수가 설정되지 않았습니다. (NCP_* / BIZMSG_SENDER_KEY)');
  }

  const method = 'POST';
  const host = 'https://sens.apigw.ntruss.com';
  const urlPath = `/alimtalk/v2/services/${serviceId}/messages`;
  const timestamp = Date.now().toString();

  // 서명 생성
  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const message = `${method} ${urlPath}\n${timestamp}\n${accessKey}`;
  const signature = hmac.update(message).digest('base64');

  const toLocal = normalizeToLocalKoreanNumber(toE164);
  const content = renderAlimtalkContent(templateCode, variables);

  const body: any = {
    templateCode,
    senderKey,
    messages: [
      {
        to: toLocal,
        content: {
          title: content.title,
          message: content.message,
          ...(content.buttons ? { buttons: content.buttons } : {}),
        },
      },
    ],
  };

  const res = await fetch(`${host}${urlPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': accessKey,
      'x-ncp-apigw-signature-v2': signature,
    },
    body: JSON.stringify(body),
  });

  const payload = { provider: 'ncp_sens_alimtalk', status: res.status, body: await res.clone().text() };
  if (!res.ok) {
    await logMessage({ channel: 'ALIMTALK', to: toE164, payload, status: 'FAILED', error: `status ${res.status}` });
    throw new Error(`SENS 알림톡 응답 오류 (status ${res.status})`);
  }
  await logMessage({ channel: 'ALIMTALK', to: toE164, payload, status: 'SENT' });
  return { ok: true, provider: 'ncp_sens', message: 'queued' } as const;
}

// Solapi 연동 (카카오 알림톡)
async function sendAlimtalkViaSolapi(toE164: string, templateCode: string, variables: Record<string, string>) {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderKey = process.env.SOLAPI_SENDER_KEY; // 카카오 비즈니스 채널 senderKey
  const templateId = process.env.SOLAPI_TEMPLATE_ID_DG_REQUEST; // 본 템플릿 ID

  if (!apiKey || !apiSecret || !senderKey || !templateId) {
    throw new Error('Solapi 환경 변수가 설정되지 않았습니다. (SOLAPI_*)');
  }

  const content = renderAlimtalkContent(templateCode, variables);
  const toLocal = normalizeToLocalKoreanNumber(toE164);

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const body: any = {
    senderKey,
    templateId,
    messages: [
      {
        to: toLocal,
        // 일부 템플릿은 변수 바인딩을 사용함. 변수 이름은 템플릿에 등록된 키를 사용해야 함.
        // 여기서는 일반적인 키를 그대로 전달. (운영 환경에서는 실제 템플릿 변수명에 맞추어 조정 필요)
        variables: variables,
        // 일부 템플릿은 message/title 없이 variables만 요구. 안전하게 함께 전달
        message: content.message,
        title: content.title,
        buttons: content.buttons,
      },
    ],
  };

  const res = await fetch('https://api.solapi.com/kakao/v1/alimtalk/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  const payload = { provider: 'solapi_alimtalk', status: res.status, body: await res.clone().text() };
  if (!res.ok) {
    await logMessage({ channel: 'ALIMTALK', to: toE164, payload, status: 'FAILED', error: `status ${res.status}` });
    throw new Error(`Solapi Alimtalk 응답 오류 (status ${res.status})`);
  }
  await logMessage({ channel: 'ALIMTALK', to: toE164, payload, status: 'SENT' });
  return { ok: true, provider: 'solapi', message: 'queued' } as const;
}

export async function sendAlimtalk(
  to: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<{ ok: boolean; provider?: string; message?: string }> {
  const provider = (process.env.BIZMSG_PROVIDER || process.env.MESSAGE_PROVIDER || 'mock').toLowerCase();
  try {
    if (provider === 'solapi') {
      return await sendAlimtalkViaSolapi(to, templateCode, variables);
    }
    if (provider === 'ncp_sens' || provider === 'ncloud' || provider === 'naver') {
      return await sendAlimtalkViaNaverSENS(to, templateCode, variables);
    }

    // 기본: 목킹 (로컬/미설정 환경)
    const payload = { templateCode, variables };
    console.log('[ALIMTALK:mock] to=%s, template=%s, vars=%o', to, templateCode, variables);
    await logMessage({ channel: 'ALIMTALK', to, payload, status: 'SENT' });
    return { ok: true, provider: 'mock', message: 'queued' };
  } catch (error: any) {
    await logMessage({ channel: 'ALIMTALK', to, payload: { templateCode, variables }, status: 'FAILED', error: error?.message });
    return { ok: false, message: error?.message };
  }
}

function normalizeToLocalKoreanNumber(e164: string): string {
  const digits = String(e164 || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('82')) return `0${digits.slice(2)}`;
  if (digits.startsWith('0')) return digits;
  return `0${digits}`;
}

async function sendViaNaverSENS(toE164: string, text: string) {
  const serviceId = process.env.NCP_SENS_SERVICE_ID;
  const accessKey = process.env.NCP_SENS_ACCESS_KEY;
  const secretKey = process.env.NCP_SENS_SECRET_KEY;
  const sender = process.env.NCP_SENS_SENDER;

  if (!serviceId || !accessKey || !secretKey || !sender) {
    throw new Error('SENS 환경 변수가 설정되지 않았습니다. (NCP_SENS_*)');
  }

  const method = 'POST';
  const host = 'https://sens.apigw.ntruss.com';
  const urlPath = `/sms/v2/services/${serviceId}/messages`;
  const timestamp = Date.now().toString();

  // 서명 생성
  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const message = `${method} ${urlPath}\n${timestamp}\n${accessKey}`;
  const signature = hmac.update(message).digest('base64');

  const toLocal = normalizeToLocalKoreanNumber(toE164); // 예: +8210... -> 010...
  const body = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: sender,
    content: text,
    messages: [{ to: toLocal }],
  } as const;

  const res = await fetch(`${host}${urlPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': accessKey,
      'x-ncp-apigw-signature-v2': signature,
    },
    body: JSON.stringify(body),
  });

  const payload = { provider: 'ncp_sens', status: res.status, body: await res.clone().text() };
  if (!res.ok) {
    await logMessage({ channel: 'SMS', to: toE164, payload, status: 'FAILED', error: `status ${res.status}` });
    throw new Error(`SENS 응답 오류 (status ${res.status})`);
  }
  await logMessage({ channel: 'SMS', to: toE164, payload, status: 'SENT' });
  return { ok: true, provider: 'ncp_sens', message: 'queued' } as const;
}

export async function sendSMS(to: string, text: string): Promise<{ ok: boolean; provider?: string; message?: string }> {
  const provider = (process.env.SMS_PROVIDER || process.env.MESSAGE_PROVIDER || 'mock').toLowerCase();
  try {
    if (provider === 'solapi') {
      const apiKey = process.env.SOLAPI_API_KEY;
      const apiSecret = process.env.SOLAPI_API_SECRET;
      const from = process.env.SOLAPI_SMS_SENDER;
      if (!apiKey || !apiSecret || !from) throw new Error('Solapi SMS 환경변수 누락');
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      const toLocal = normalizeToLocalKoreanNumber(to);
      const body: any = {
        messages: [
          {
            to: toLocal,
            from,
            text,
          },
        ],
      };
      const res = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
      });
      const payload = { provider: 'solapi_sms', status: res.status, body: await res.clone().text() };
      if (!res.ok) {
        await logMessage({ channel: 'SMS', to, payload, status: 'FAILED', error: `status ${res.status}` });
        throw new Error(`Solapi SMS 응답 오류 (status ${res.status})`);
      }
      await logMessage({ channel: 'SMS', to, payload, status: 'SENT' });
      return { ok: true, provider: 'solapi', message: 'queued' };
    }
    if (provider === 'ncp_sens' || provider === 'naver' || provider === 'sens') {
      return await sendViaNaverSENS(to, text);
    }

    // 기본: 목킹 (로컬/미설정 환경)
    console.log('[SMS:mock] to=%s, text=%s', to, text);
    await logMessage({ channel: 'SMS', to, payload: { text, provider: 'mock' }, status: 'SENT' });
    return { ok: true, provider: 'mock', message: 'queued' };
  } catch (error: any) {
    await logMessage({ channel: 'SMS', to, payload: { text, provider }, status: 'FAILED', error: error?.message });
    return { ok: false, message: error?.message };
  }
}


