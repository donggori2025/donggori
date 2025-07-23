import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 체크
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 설정되지 않음');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 설정되지 않음');
  console.error('');
  console.error('📝 해결 방법:');
  console.error('1. 프로젝트 루트에 .env.local 파일을 생성하세요');
  console.error('2. 다음 내용을 추가하세요:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('3. Supabase 프로젝트에서 URL과 Anon Key를 확인하세요');
  console.error('4. 개발 서버를 재시작하세요');
  console.error('');
  console.error('🔗 Supabase 설정 가이드: https://supabase.com/docs/guides/getting-started');
} else {
  console.log('✅ Supabase 환경 변수가 설정되었습니다.');
  console.log('URL 길이:', supabaseUrl?.length || 0);
  console.log('Key 길이:', supabaseAnonKey?.length || 0);
}

// 임시 클라이언트 생성 (환경 변수가 없을 때)
const createTempClient = () => {
  return createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  );
};

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
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
    })
  : createTempClient();

// 환경 변수 상태 확인 함수
export const checkSupabaseConfig = () => {
  return {
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length || 0
  };
};

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key 존재 여부:', !!supabaseAnonKey);
    console.log('Supabase Key 길이:', supabaseAnonKey?.length || 0);
    
    // 클라이언트 생성 확인
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 생성되지 않았습니다.');
      return {
        success: false,
        error: 'Supabase 클라이언트 생성 실패'
      };
    }
    
    console.log('✅ Supabase 클라이언트 생성됨');
    
    // 직접 donggori 테이블 테스트
    console.log('🔍 donggori 테이블 테스트 중...');
    
    // 먼저 간단한 쿼리로 테스트
    const { data, error } = await supabase
      .from("donggori")
      .select("id")
      .limit(1);
    
    console.log('donggori 테이블 쿼리 결과:', { 
      data: data, 
      error: error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint
    });
    
    if (error) {
      console.log('donggori 테이블 접근 실패, 다른 테이블로 테스트...');
      
      // 다른 테이블로 테스트
      const { data: otherData, error: otherError } = await supabase
        .from("factory_auth")
        .select("id")
        .limit(1);
      
      console.log('factory_auth 테이블 쿼리 결과:', { 
        data: otherData, 
        error: otherError,
        errorMessage: otherError?.message,
        errorCode: otherError?.code
      });
      
      console.error("❌ Supabase 연결 테스트 실패:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return {
        success: false,
        error: error.message || '알 수 없는 오류',
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }
    
    console.log("✅ Supabase 연결 테스트 성공");
    return {
      success: true,
      data: data,
      count: data?.length || 0
    };
  } catch (error) {
    console.error("❌ Supabase 연결 테스트 중 예외 발생:", error);
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
    console.log('🔍 match_requests 테이블 구조 확인 중...');
    
    // 테이블 존재 여부 확인
    const { data, error } = await supabase
      .from("match_requests")
      .select("*")
      .limit(1);
    
    console.log('match_requests 테이블 접근 결과:', { 
      data: data, 
      error: error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint
    });
    
    if (error) {
      console.error("❌ match_requests 테이블 접근 실패:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return {
        success: false,
        error: error.message || '알 수 없는 오류',
        code: error.code,
        details: error.details,
        hint: error.hint
      };
    }
    
    console.log("✅ match_requests 테이블 접근 성공");
    return {
      success: true,
      data: data,
      count: data?.length || 0
    };
  } catch (error) {
    console.error("❌ match_requests 테이블 확인 중 예외 발생:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}; 