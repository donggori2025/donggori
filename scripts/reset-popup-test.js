// 팝업 테스트용 스크립트
// 브라우저 콘솔에서 실행하세요

function resetPopupTest() {
  // 오늘 날짜의 팝업 숨김 키 삭제
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const key = `popup_hidden_${ymd}`;
  
  localStorage.removeItem(key);
  console.log(`✅ 팝업 숨김 설정이 초기화되었습니다.`);
  console.log(`삭제된 키: ${key}`);
  console.log(`페이지를 새로고침하면 팝업이 다시 나타날 것입니다.`);
  
  return true;
}

function showAllPopupKeys() {
  // 모든 팝업 관련 키 확인
  const popupKeys = Object.keys(localStorage).filter(key => key.startsWith('popup_hidden_'));
  console.log('현재 저장된 팝업 숨김 키들:');
  popupKeys.forEach(key => {
    console.log(`- ${key}: ${localStorage.getItem(key)}`);
  });
  return popupKeys;
}

function clearAllPopupKeys() {
  // 모든 팝업 숨김 키 삭제
  const popupKeys = Object.keys(localStorage).filter(key => key.startsWith('popup_hidden_'));
  popupKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`삭제된 키: ${key}`);
  });
  console.log(`✅ 모든 팝업 숨김 설정이 초기화되었습니다.`);
  return popupKeys.length;
}

// 사용법:
// 1. resetPopupTest() - 오늘 날짜의 팝업 숨김 설정만 초기화
// 2. showAllPopupKeys() - 모든 팝업 관련 키 확인
// 3. clearAllPopupKeys() - 모든 팝업 숨김 설정 초기화

console.log('팝업 테스트 스크립트가 로드되었습니다.');
console.log('사용 가능한 함수:');
console.log('- resetPopupTest() - 오늘 팝업 숨김 설정 초기화');
console.log('- showAllPopupKeys() - 모든 팝업 키 확인');
console.log('- clearAllPopupKeys() - 모든 팝업 숨김 설정 초기화');
