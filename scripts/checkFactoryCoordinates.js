import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFactoryCoordinates() {
  try {
    console.log('🔍 팩토리 좌표 확인 중...\n');
    
    const { data, error } = await supabase.from("donggori").select("*");
    
    if (error) {
      console.error('❌ Supabase 조회 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 데이터가 없습니다.');
      return;
    }

    console.log(`📊 총 ${data.length}개의 팩토리 데이터를 찾았습니다.\n`);

    // 재민상사 특별 확인
    const jaemin = data.find(f => f.company_name === '재민상사');
    if (jaemin) {
      console.log('🏭 재민상사 좌표:');
      console.log(`   ID: ${jaemin.id}`);
      console.log(`   위도: ${jaemin.lat}`);
      console.log(`   경도: ${jaemin.lng}`);
      console.log(`   주소: ${jaemin.address}`);
      console.log('');
    }

    // 모든 팩토리 좌표 출력
    console.log('📋 모든 팩토리 좌표:');
    data.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name || factory.name || '이름 없음'}`);
      console.log(`   ID: ${factory.id}`);
      console.log(`   위도: ${factory.lat}`);
      console.log(`   경도: ${factory.lng}`);
      console.log(`   주소: ${factory.address || '주소 없음'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkFactoryCoordinates(); 