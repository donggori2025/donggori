import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabaseService";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  
  // 환경변수 상세 검증
  const envCheck = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  };
  
  console.log("환경변수 상세 확인:", envCheck);
  
  // 환경변수 누락 시 즉시 오류 반환
  if (!envCheck.hasUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않음");
    return NextResponse.json({ 
      success: false, 
      error: "환경변수 오류: NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.",
      debug: envCheck
    }, { status: 500 });
  }
  
  if (!envCheck.hasServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않음");
    return NextResponse.json({ 
      success: false, 
      error: "환경변수 오류: SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.",
      debug: envCheck
    }, { status: 500 });
  }
  
  try {
    console.log("GET /api/admin/factories - 시작");

    // Supabase 클라이언트 생성 시도
    let supabase;
    try {
      supabase = getServiceSupabase();
      console.log("Supabase 클라이언트 생성 완료");
    } catch (clientError) {
      console.error("Supabase 클라이언트 생성 실패:", clientError);
      return NextResponse.json({ 
        success: false, 
        error: `Supabase 클라이언트 생성 실패: ${clientError instanceof Error ? clientError.message : '알 수 없는 오류'}`,
        debug: envCheck
      }, { status: 500 });
    }

    // 간단한 연결 테스트
    try {
      const { data: testData, error: testError } = await supabase
        .from("donggori")
        .select("id")
        .limit(1);
      
      console.log("Supabase 연결 테스트 결과:", { 
        hasTestData: !!testData, 
        testDataLength: testData?.length, 
        hasTestError: !!testError,
        testError: testError?.message 
      });

      if (testError) {
        console.error("Supabase 연결 테스트 실패:", testError);
        return NextResponse.json({ 
          success: false, 
          error: `Supabase 연결 테스트 실패: ${testError.message}`,
          debug: envCheck
        }, { status: 500 });
      }
    } catch (testError) {
      console.error("Supabase 연결 테스트 중 예외 발생:", testError);
      return NextResponse.json({ 
        success: false, 
        error: `Supabase 연결 테스트 중 예외: ${testError instanceof Error ? testError.message : '알 수 없는 오류'}`,
        debug: envCheck
      }, { status: 500 });
    }

    // 실제 데이터 조회
    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .order("id", { ascending: false });

    console.log("Supabase 쿼리 결과:", { 
      hasData: !!data, 
      dataLength: data?.length, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error("Supabase 쿼리 오류:", error);
      return NextResponse.json({ 
        success: false, 
        error: `데이터베이스 쿼리 오류: ${error.message}`,
        debug: envCheck
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("GET /api/admin/factories - 예외 발생:", e);
    const message = e instanceof Error ? e.message : "알 수 없는 서버 오류";
    return NextResponse.json({ 
      success: false, 
      error: `서버 오류: ${message}`,
      debug: envCheck
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const body = await req.json();
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("donggori").insert({
      // 전달된 모든 컬럼을 그대로 허용 (화이트리스트 필요 시 교체)
      ...body,
    });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/admin/factories - 예외 발생:", e);
    const message = e instanceof Error ? e.message : "알 수 없는 서버 오류";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


