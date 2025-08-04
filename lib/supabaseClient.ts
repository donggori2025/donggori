import { createClient } from "@supabase/supabase-js";
import { config, validateConfig } from "./config";

// 환경 변수 검증
const validation = validateConfig();

if (!validation.isValid) {
  throw new Error(`Supabase 설정 오류: ${validation.errors.join(', ')}`);
}

// Supabase 클라이언트 생성
export const supabase = createClient(
  config.supabase.url!,
  config.supabase.anonKey!,
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

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
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
      data: data,
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
      data: data,
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