import { createClient } from "@supabase/supabase-js";

// 서버 전용 Supabase (Service Role)
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // 빌드 시에는 더미 클라이언트 반환
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
      console.warn('⚠️ Supabase 설정이 누락되어 더미 클라이언트를 반환합니다.');
      return {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          })
        })
      } as any;
    }
    throw new Error("Supabase 서비스 키 또는 URL이 설정되어 있지 않습니다.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}


