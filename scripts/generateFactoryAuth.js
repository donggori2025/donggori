const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 롤 키 사용

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 봉제공장 인증 정보 생성 함수
async function generateFactoryAuth() {
  try {
    console.log('봉제공장 인증 정보 생성을 시작합니다...');

    // 먼저 기존 factories 테이블에서 공장 정보를 가져옵니다
    const { data: factories, error: fetchError } = await supabase
      .from('factories')
      .select('id, name')
      .order('id');

    if (fetchError) {
      console.error('공장 정보 조회 중 오류:', fetchError);
      return;
    }

    console.log(`${factories.length}개의 공장을 찾았습니다.`);

    // factory_auth 테이블이 있는지 확인하고, 없다면 생성
    const { error: tableCheckError } = await supabase
      .from('factory_auth')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === '42P01') {
      // 테이블이 없으면 생성
      console.log('factory_auth 테이블을 생성합니다...');
      const { error: createTableError } = await supabase.rpc('create_factory_auth_table');
      if (createTableError) {
        console.error('테이블 생성 중 오류:', createTableError);
        return;
      }
    }

    // 각 공장별로 인증 정보 생성
    const authData = factories.map((factory, index) => {
      const factoryNumber = (index + 1).toString().padStart(2, '0');
      
      // 공장명에서 지역 추출 (예: "서울패션공장" -> "seoul")
      let region = '';
      if (factory.name.includes('서울')) region = 'seoul';
      else if (factory.name.includes('부산')) region = 'busan';
      else if (factory.name.includes('대구')) region = 'daegu';
      else if (factory.name.includes('인천')) region = 'incheon';
      else if (factory.name.includes('광주')) region = 'gwangju';
      else if (factory.name.includes('대전')) region = 'daejeon';
      else if (factory.name.includes('울산')) region = 'ulsan';
      else if (factory.name.includes('경기')) region = 'gyeonggi';
      else if (factory.name.includes('강원')) region = 'gangwon';
      else if (factory.name.includes('충북')) region = 'chungbuk';
      else if (factory.name.includes('충남')) region = 'chungnam';
      else if (factory.name.includes('전북')) region = 'jeonbuk';
      else if (factory.name.includes('전남')) region = 'jeonnam';
      else if (factory.name.includes('경북')) region = 'gyeongbuk';
      else if (factory.name.includes('경남')) region = 'gyeongnam';
      else if (factory.name.includes('제주')) region = 'jeju';
      else if (factory.name.includes('세종')) region = 'sejong';
      else if (factory.name.includes('수원')) region = 'suwon';
      else if (factory.name.includes('성남')) region = 'seongnam';
      else if (factory.name.includes('부천')) region = 'bucheon';
      else if (factory.name.includes('고양')) region = 'goyang';
      else if (factory.name.includes('안산')) region = 'ansan';
      else if (factory.name.includes('안양')) region = 'anyang';
      else if (factory.name.includes('평택')) region = 'pyeongtaek';
      else if (factory.name.includes('시흥')) region = 'siheung';
      else if (factory.name.includes('의정부')) region = 'uijeongbu';
      else if (factory.name.includes('용인')) region = 'yongin';
      else if (factory.name.includes('파주')) region = 'paju';
      else if (factory.name.includes('이천')) region = 'icheon';
      else if (factory.name.includes('안성')) region = 'anseong';
      else if (factory.name.includes('김포')) region = 'gimpo';
      else if (factory.name.includes('화성')) region = 'hwasung';
      else if (factory.name.includes('광명')) region = 'kwangmyung';
      else if (factory.name.includes('군포')) region = 'gunpo';
      else if (factory.name.includes('오산')) region = 'osan';
      else if (factory.name.includes('하남')) region = 'hanam';
      else if (factory.name.includes('여주')) region = 'yeoju';
      else if (factory.name.includes('포천')) region = 'pocheon';
      else if (factory.name.includes('양평')) region = 'yangpyeong';
      else if (factory.name.includes('가평')) region = 'gapyeong';
      else if (factory.name.includes('양주')) region = 'yangju';
      else if (factory.name.includes('동두천')) region = 'dongducheon';
      else if (factory.name.includes('구리')) region = 'guri';
      else if (factory.name.includes('남양주')) region = 'namyangju';
      else if (factory.name.includes('의왕')) region = 'uiwang';
      else region = 'factory';

      // 중복 방지를 위해 번호 추가
      const suffix = index > 0 ? (index + 1).toString() : '';
      const username = `${region}_factory${suffix}`;
      const password = `${region}1234!`;

      return {
        id: factory.id,
        factory_id: factory.id,
        username: username,
        password: password,
        factory_name: factory.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    console.log('생성된 인증 정보:');
    authData.forEach(auth => {
      console.log(`${auth.factory_name}: ${auth.username} / ${auth.password}`);
    });

    // 기존 데이터 삭제 (선택사항)
    const { error: deleteError } = await supabase
      .from('factory_auth')
      .delete()
      .neq('id', '0'); // 모든 데이터 삭제

    if (deleteError) {
      console.error('기존 데이터 삭제 중 오류:', deleteError);
    }

    // 새로운 인증 정보 삽입
    const { data: insertData, error: insertError } = await supabase
      .from('factory_auth')
      .insert(authData)
      .select();

    if (insertError) {
      console.error('인증 정보 삽입 중 오류:', insertError);
      return;
    }

    console.log(`\n✅ 성공적으로 ${insertData.length}개의 봉제공장 인증 정보를 생성했습니다!`);
    console.log('\n생성된 로그인 정보:');
    console.log('='.repeat(60));
    
    insertData.forEach(auth => {
      console.log(`${auth.factory_name.padEnd(20)} | ${auth.username.padEnd(20)} | ${auth.password}`);
    });
    
    console.log('='.repeat(60));
    console.log('\n이제 봉제공장들이 이 정보로 로그인할 수 있습니다.');

  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
generateFactoryAuth(); 