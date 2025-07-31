const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.qjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqj';

const supabase = createClient(supabaseUrl, supabaseKey);

// 실제 좌표 데이터
const coordinates = [
  { lat: 37.5948937, lng: 127.0491562 },
  { lat: 37.5763928, lng: 127.0736105 },
  { lat: 37.5756614, lng: 127.0309656 },
  { lat: 37.5746512, lng: 127.0304177 },
  { lat: 37.5789929, lng: 127.070443 },
  { lat: 37.5754049, lng: 127.0421177 },
  { lat: 37.5762551, lng: 127.0699862 },
  { lat: 37.5730471, lng: 127.0275867 },
  { lat: 37.5739082, lng: 127.0248202 },
  { lat: 37.5748406, lng: 127.0268925 },
  { lat: 37.5744741, lng: 127.0302554 },
  { lat: 37.5759582, lng: 127.0262551 },
  { lat: 37.5765887, lng: 127.0281032 },
  { lat: 37.5786773, lng: 127.0293213 },
  { lat: 37.5807489, lng: 127.0270867 },
  { lat: 37.5749492, lng: 127.0314252 },
  { lat: 37.5758651, lng: 127.0307869 },
  { lat: 37.574396, lng: 127.0322747 },
  { lat: 37.5744741, lng: 127.0302554 },
  { lat: 37.5762931, lng: 127.0318033 },
  { lat: 37.5760024, lng: 127.0311217 },
  { lat: 37.5732791, lng: 127.0681128 },
  { lat: 37.5743643, lng: 127.0308734 },
  { lat: 37.5746502, lng: 127.0302317 },
  { lat: 37.5700056, lng: 127.0504641 },
  { lat: 37.5762551, lng: 127.0699862 },
  { lat: 37.573216, lng: 127.0590537 },
  { lat: 37.5760845, lng: 127.0421671 },
  { lat: 37.5760143, lng: 127.0413381 },
  { lat: 37.5747991, lng: 127.0410408 },
  { lat: 37.5682801, lng: 127.0587495 },
  { lat: 37.5627067, lng: 127.0605376 },
  { lat: 37.5680609, lng: 127.0643178 },
  { lat: 37.5742167, lng: 127.0421851 },
  { lat: 37.574504, lng: 127.031912 },
  { lat: 37.5792868, lng: 127.0338169 },
  { lat: 37.5759207, lng: 127.0274882 },
  { lat: 37.5742813, lng: 127.0276767 },
  { lat: 37.5768006, lng: 127.0416857 },
  { lat: 37.5766765, lng: 127.0414831 },
  { lat: 37.5680609, lng: 127.0643178 },
  { lat: 37.5837809, lng: 127.052581 },
  { lat: 37.5812374, lng: 127.0520338 },
  { lat: 37.5842031, lng: 127.0478594 },
  { lat: 37.5734896, lng: 127.0578789 },
  { lat: 37.5742813, lng: 127.0276767 },
  { lat: 37.5742813, lng: 127.0276767 },
  { lat: 37.5968942, lng: 127.0663107 },
  { lat: 37.5758305, lng: 127.0415285 },
  { lat: 37.5754049, lng: 127.0421177 },
  { lat: 37.5771228, lng: 127.0378432 },
  { lat: 37.5772547, lng: 127.0321464 },
  { lat: 37.5787194, lng: 127.0287103 },
  { lat: 37.5775469, lng: 127.0270397 },
  { lat: 37.5775469, lng: 127.0270397 },
  { lat: 37.5744841, lng: 127.0311944 },
  { lat: 37.5760143, lng: 127.0413381 },
  { lat: 37.5752893, lng: 127.040234 },
  { lat: 37.5756107, lng: 127.0303463 },
  { lat: 37.5733318, lng: 127.0283575 },
  { lat: 37.5772391, lng: 127.0313655 },
  { lat: 37.6034374, lng: 127.065297 },
  { lat: 37.5852402, lng: 127.0373363 },
  { lat: 37.5663544, lng: 127.0662935 },
  { lat: 37.5639813, lng: 127.063217 },
  { lat: 37.5722562, lng: 127.0576034 },
  { lat: 37.5760207, lng: 127.0332629 },
  { lat: 37.5657986, lng: 127.0668405 },
  { lat: 37.5865011, lng: 127.041401 },
  { lat: 37.5658685, lng: 127.0664446 },
  { lat: 37.5665678, lng: 127.0673458 },
  { lat: 37.5777725, lng: 127.0253008 },
  { lat: 37.5777725, lng: 127.0253008 },
  { lat: 37.5744821, lng: 127.0332524 }
];

async function updateFactoryCoordinates() {
  try {
    console.log('🔍 공장 데이터 조회 중...');
    
    // 공장 데이터 조회
    const { data: factories, error } = await supabase
      .from('donggori')
      .select('id, company_name, name')
      .order('id');

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`✅ 총 ${factories.length}개의 공장 데이터 확인됨`);
    console.log(`📍 총 ${coordinates.length}개의 좌표 데이터 확인됨\n`);

    // 각 공장에 좌표 할당
    for (let i = 0; i < factories.length && i < coordinates.length; i++) {
      const factory = factories[i];
      const coord = coordinates[i];
      
      console.log(`${i + 1}. ${factory.company_name || factory.name} -> (${coord.lat}, ${coord.lng})`);
      
      // 좌표 업데이트
      const { error: updateError } = await supabase
        .from('donggori')
        .update({ 
          latitude: coord.lat,
          longitude: coord.lng
        })
        .eq('id', factory.id);

      if (updateError) {
        console.error(`❌ ${factory.company_name || factory.name} 좌표 업데이트 실패:`, updateError);
      } else {
        console.log(`✅ ${factory.company_name || factory.name} 좌표 업데이트 완료`);
      }
    }

    console.log('\n🎉 모든 공장 좌표 업데이트 완료!');

  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
  }
}

updateFactoryCoordinates(); 