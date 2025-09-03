import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export type SessionType = 'local' | 'sns';

const supabaseServer = config.supabase.url && config.supabase.serviceRoleKey
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } })
  : null;

function createToken(): string {
  // UUID 기반 토큰 (충분히 랜덤)
  // 환경에 따라 crypto.randomUUID 사용 가능
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  // fallback
  return [1,2,3,4].map(() => Math.random().toString(36).slice(2)).join('');
}

export async function createSessionRecord(input: {
  type: SessionType;
  userId?: string | null;
  userEmail?: string | null;
  externalId?: string | null;
  provider?: string | null;
  isInitialized?: boolean;
  ttlSec?: number; // 기본 7일
}): Promise<{ token: string }>
{
  if (!supabaseServer) throw new Error('Supabase service key missing');
  const token = createToken();
  const now = Date.now();
  const ttl = (input.ttlSec ?? 60 * 60 * 24 * 7) * 1000;
  const expiresAt = new Date(now + ttl).toISOString();
  const payload = {
    id: token,
    type: input.type,
    user_id: input.userId ?? null,
    user_email: input.userEmail ?? null,
    external_id: input.externalId ?? null,
    provider: input.provider ?? null,
    is_initialized: !!input.isInitialized,
    expires_at: expiresAt,
    created_at: new Date(now).toISOString(),
  } as const;

  const { error } = await supabaseServer.from('sessions').insert([payload]);
  if (error) throw new Error(error.message);
  return { token };
}

export async function verifySessionToken(token: string): Promise<{
  valid: boolean;
  data?: any;
}>
{
  if (!supabaseServer) return { valid: false };
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('id', token)
    .limit(1)
    .maybeSingle();
  if (error || !data) return { valid: false };
  if (data.expires_at && Date.parse(data.expires_at) < Date.now()) {
    return { valid: false };
  }
  return { valid: true, data };
}


