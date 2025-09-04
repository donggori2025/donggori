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

export async function sendAlimtalk(
  to: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<{ ok: boolean; provider?: string; message?: string }> {
  // 실제 대행사 연동 전까지는 콘솔 로깅 + DB 로깅만 수행
  try {
    const payload = { templateCode, variables };
    console.log('[ALIMTALK] to=%s, template=%s, vars=%o', to, templateCode, variables);
    await logMessage({ channel: 'ALIMTALK', to, payload, status: 'SENT' });
    return { ok: true, provider: process.env.BIZMSG_PROVIDER || 'mock', message: 'queued' };
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
  const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
  try {
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


