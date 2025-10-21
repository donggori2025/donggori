import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { sendEmail } from './messaging';

// 환경변수 유효성 검사 강화
const supabaseServer = config.supabase.url && config.supabase.serviceRoleKey && 
  config.supabase.url !== 'your-supabase-url' && 
  config.supabase.url !== 'your-supabase-url/' &&
  config.supabase.url.startsWith('http') &&
  config.supabase.serviceRoleKey.length > 10
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } })
  : null;

export type OtpPurpose = 'signup' | 'login' | 'reset';

export async function requestEmailOtp(email: string, purpose: OtpPurpose) {
  if (!supabaseServer) throw new Error('Supabase service key is missing');
  const code = generateCode(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // rate limit: 최근 60초 내 발송 체크
  const { data: recent } = await supabaseServer
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);
  if (recent && recent[0]) {
    const last = new Date(recent[0].created_at).getTime();
    if (Date.now() - last < 60 * 1000) {
      throw new Error('요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  const { error } = await supabaseServer.from('email_otps').insert([
    { email, code, purpose, expires_at: expiresAt, created_at: new Date().toISOString() },
  ]);
  if (error) {
    console.error('[ERROR] Supabase insert failed:', error);
    throw new Error(error.message);
  }

  const emailResult = await sendEmail(email, `[동고리] 인증번호 ${code} (5분 내 유효)`, `동고리 이메일 인증번호입니다.\n\n인증번호: ${code}\n\n이 인증번호는 5분 내에 유효합니다.\n\n감사합니다.`);
  if (!emailResult.ok) {
    throw new Error(emailResult.message || '이메일 발송 실패');
  }
  return { ok: true };
}

export async function verifyEmailOtp(email: string, code: string, purpose: OtpPurpose) {
  if (!supabaseServer) throw new Error('Supabase service key is missing');
  const { data, error } = await supabaseServer
    .from('email_otps')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const record = data?.[0];
  if (!record) throw new Error('인증 요청을 찾을 수 없습니다.');
  if (record.code !== code) throw new Error('인증 코드가 올바르지 않습니다.');
  if (new Date(record.expires_at).getTime() < Date.now()) throw new Error('인증 코드가 만료되었습니다.');

  // 일회성 사용 처리
  await supabaseServer.from('email_otps').update({ consumed_at: new Date().toISOString() }).eq('id', record.id);
  return { ok: true };
}

function generateCode(length: number) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}
