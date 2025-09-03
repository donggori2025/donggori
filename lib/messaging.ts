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

export async function sendSMS(to: string, text: string): Promise<{ ok: boolean; provider?: string; message?: string }> {
  try {
    console.log('[SMS] to=%s, text=%s', to, text);
    await logMessage({ channel: 'SMS', to, payload: { text }, status: 'SENT' });
    return { ok: true, provider: process.env.SMS_PROVIDER || 'mock', message: 'queued' };
  } catch (error: any) {
    await logMessage({ channel: 'SMS', to, payload: { text }, status: 'FAILED', error: error?.message });
    return { ok: false, message: error?.message };
  }
}


