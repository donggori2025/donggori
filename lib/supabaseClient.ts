import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

// Supabase 클라이언트 생성 (빌드 시 안전하게 처리)
let supabase: any;

try {
  // 환경변수 유효성 검사 강화
  if (config.supabase.url && config.supabase.anonKey && 
      config.supabase.url !== 'your-supabase-url' && 
      config.supabase.url !== 'your-supabase-url/' &&
      config.supabase.url.startsWith('http') &&
      config.supabase.anonKey.length > 10) {
    supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'X-Client-Info': 'donggori-app'
          }
        }
      }
    );
  } else {
    // 환경 변수가 없을 때 더미 클라이언트 생성
    console.warn('⚠️ Supabase 설정이 누락되어 더미 클라이언트를 생성합니다.');
    supabase = {
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      })
    };
  }
} catch (error) {
  console.warn('⚠️ Supabase 클라이언트 생성 실패:', error);
  // 더미 클라이언트 생성
  supabase = {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    })
  };
}

export { supabase };

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    // 더미 클라이언트인 경우
    if (!config.supabase.url || !config.supabase.anonKey) {
      return {
        success: false,
        error: 'Supabase 설정이 누락되었습니다.',
        data: null,
        count: 0
      };
    }

    const { data, error } = await supabase
      .from("donggori")
      .select("id")
      .limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message || '알 수 없는 오류',
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }
    
    return {
      success: true,
      data,
      count: data?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}; 

// match_requests 테이블 구조 확인 함수
export const checkMatchRequestsTable = async () => {
  try {
    // 더미 클라이언트인 경우
    if (!config.supabase.url || !config.supabase.anonKey) {
      return {
        success: false,
        error: 'Supabase 설정이 누락되었습니다.',
        data: null,
        count: 0
      };
    }

    const { data, error } = await supabase
      .from("match_requests")
      .select("*")
      .limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message || '알 수 없는 오류',
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }
    
    return {
      success: true,
      data,
      count: data?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}; 