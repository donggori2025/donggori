import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });

  const supabase = getServiceSupabase();
  
  try {
    // donggori 테이블에서 샘플 데이터를 가져와서 스키마 정보 생성
    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 샘플 데이터가 있으면 해당 데이터를 기반으로 스키마 정보 생성
    if (data && data.length > 0) {
      const sampleRecord = data[0];
      const schemaInfo = Object.keys(sampleRecord).map(key => ({
        column_name: key,
        data_type: typeof sampleRecord[key],
        is_nullable: sampleRecord[key] === null,
        character_maximum_length: null,
        column_default: null
      }));

      return NextResponse.json({ success: true, data: schemaInfo });
    }

    // 샘플 데이터가 없으면 기본 스키마 정보 반환
    const defaultSchema = [
      { column_name: "id", data_type: "number", is_nullable: false, character_maximum_length: null, column_default: null },
      { column_name: "company_name", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "address", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "business_type", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "phone_number", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "moq", data_type: "number", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "monthly_capacity", data_type: "number", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "admin_district", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "intro", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "lat", data_type: "number", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "lng", data_type: "number", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "images", data_type: "array", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "created_at", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null },
      { column_name: "updated_at", data_type: "string", is_nullable: true, character_maximum_length: null, column_default: null }
    ];

    return NextResponse.json({ success: true, data: defaultSchema });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "스키마 정보를 가져오는데 실패했습니다." 
    }, { status: 500 });
  }
}


