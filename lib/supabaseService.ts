import { createClient } from "@supabase/supabase-js";

// Service Role Key를 사용하는 Supabase 클라이언트 (관리자 권한)
let supabaseService: any;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // 환경변수 유효성 검사 강화
  if (supabaseUrl && serviceRoleKey && 
      supabaseUrl !== 'your-supabase-url' && 
      supabaseUrl !== 'your-supabase-url/' &&
      supabaseUrl.startsWith('http') &&
      serviceRoleKey.length > 10) {
    supabaseService = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'X-Client-Info': 'donggori-service'
          }
        }
      }
    );
  } else {
    console.warn('⚠️ Service Role Key가 설정되지 않았거나 유효하지 않습니다.');
    supabaseService = null;
  }
} catch (error) {
  console.warn('⚠️ Service Role 클라이언트 생성 실패:', error);
  supabaseService = null;
}

export { supabaseService };

// Service Role 클라이언트를 반환하는 함수
export function getServiceSupabase() {
  if (!supabaseService) {
    console.warn('⚠️ Service Role 클라이언트가 초기화되지 않았습니다. 더미 클라이언트를 반환합니다.');
    // 더미 클라이언트 반환 (빌드 시 오류 방지)
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Service Role 클라이언트가 초기화되지 않았습니다.' } })
          }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Service Role 클라이언트가 초기화되지 않았습니다.' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Service Role 클라이언트가 초기화되지 않았습니다.' } }),
          delete: () => Promise.resolve({ data: null, error: { message: 'Service Role 클라이언트가 초기화되지 않았습니다.' } })
        })
      })
    };
  }
  return supabaseService;
}