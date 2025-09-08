import { createClient } from "@supabase/supabase-js";

// Service Role Key를 사용하는 Supabase 클라이언트 (관리자 권한)
let supabaseService: any;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && serviceRoleKey) {
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
    console.warn('⚠️ Service Role Key가 설정되지 않았습니다.');
    supabaseService = null;
  }
} catch (error) {
  console.warn('⚠️ Service Role 클라이언트 생성 실패:', error);
  supabaseService = null;
}

export { supabaseService };