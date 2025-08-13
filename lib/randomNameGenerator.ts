// 랜덤 이름 생성 유틸리티

// 랜덤 단어 목록 (한국어)
const randomWords = [
  '행복', '희망', '꿈', '미래', '새벽', '아침', '햇살', '바람', '구름', '하늘',
  '바다', '산', '강', '꽃', '나무', '새', '별', '달', '태양', '우주',
  '사랑', '친구', '가족', '동료', '이웃', '세계', '평화', '자유', '진실', '정의',
  '지혜', '지식', '학습', '성장', '발전', '혁신', '창조', '예술', '음악', '춤',
  '운동', '건강', '에너지', '힘', '용기', '열정', '도전', '성공', '승리', '기회',
  '모험', '여행', '발견', '탐험', '비밀', '신비', '마법', '기적', '기쁨', '웃음',
  '즐거움', '만족', '감사', '축복', '행운', '기적', '신기', '특별', '유니크', '독특',
  '창의', '상상', '꿈꾸는', '희망찬', '밝은', '따뜻한', '친근한', '신뢰할', '믿음직한', '성실한',
  '정직한', '겸손한', '용감한', '지혜로운', '똑똑한', '영리한', '재능있는', '뛰어난', '훌륭한', '완벽한'
];

// 이미 사용된 이름들을 추적하기 위한 Set
const usedNames = new Set<string>();

/**
 * 랜덤 이름을 생성합니다.
 * 형식: 랜덤단어 + 2자리 숫자 (예: 행복42, 희망15)
 * 중복되지 않는 이름을 보장합니다.
 */
export function generateRandomName(): string {
  let attempts = 0;
  const maxAttempts = 1000; // 무한 루프 방지
  
  while (attempts < maxAttempts) {
    // 랜덤 단어 선택
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
    
    // 2자리 랜덤 숫자 생성 (10-99)
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    
    // 이름 조합
    const name = `${randomWord}${randomNumber}`;
    
    // 중복 확인
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    
    attempts++;
  }
  
  // 최대 시도 횟수를 초과한 경우 타임스탬프 기반 이름 생성
  const timestamp = Date.now().toString().slice(-4);
  const fallbackWord = randomWords[Math.floor(Math.random() * randomWords.length)];
  const fallbackName = `${fallbackWord}${timestamp}`;
  
  usedNames.add(fallbackName);
  return fallbackName;
}

/**
 * 이름이 이미 사용되었는지 확인합니다.
 */
export function isNameUsed(name: string): boolean {
  return usedNames.has(name);
}

/**
 * 사용된 이름 목록을 반환합니다 (디버깅용).
 */
export function getUsedNames(): string[] {
  return Array.from(usedNames);
}

/**
 * 사용된 이름 목록을 초기화합니다 (테스트용).
 */
export function clearUsedNames(): void {
  usedNames.clear();
}

/**
 * 이름의 유효성을 검사합니다.
 * - 2-10자 길이
 * - 한글, 영문, 숫자만 허용
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: '이름을 입력해주세요.' };
  }
  
  if (name.length < 2 || name.length > 10) {
    return { isValid: false, error: '이름은 2-10자 사이여야 합니다.' };
  }
  
  // 한글, 영문, 숫자만 허용하는 정규식
  const nameRegex = /^[가-힣a-zA-Z0-9]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: '이름은 한글, 영문, 숫자만 사용할 수 있습니다.' };
  }
  
  return { isValid: true };
}
