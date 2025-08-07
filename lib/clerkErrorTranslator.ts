// Clerk 오류 메시지를 한글로 변환하는 유틸리티

export const translateClerkError = (error: string): string => {
  const errorLower = error.toLowerCase();
  
  // 일반적인 Clerk 오류 메시지들
  const errorMap: { [key: string]: string } = {
    // 식별자 관련 오류
    'identifier is invalid': '이메일 주소가 올바르지 않습니다.',
    'invalid identifier': '이메일 주소가 올바르지 않습니다.',
    'identifier not found': '등록되지 않은 이메일 주소입니다.',
    'identifier already exists': '이미 가입된 이메일 주소입니다.',
    
    // 비밀번호 관련 오류
    'password is invalid': '비밀번호가 올바르지 않습니다.',
    'invalid password': '비밀번호가 올바르지 않습니다.',
    'password too short': '비밀번호가 너무 짧습니다.',
    'password too weak': '비밀번호가 너무 약합니다.',
    'password confirmation does not match': '비밀번호가 일치하지 않습니다.',
    
    // 인증 관련 오류
    'verification code is invalid': '인증 코드가 올바르지 않습니다.',
    'invalid verification code': '인증 코드가 올바르지 않습니다.',
    'verification code expired': '인증 코드가 만료되었습니다.',
    'verification code not found': '인증 코드를 찾을 수 없습니다.',
    
    // 세션 관련 오류
    'session not found': '세션을 찾을 수 없습니다.',
    'session expired': '세션이 만료되었습니다.',
    'session invalid': '세션이 올바르지 않습니다.',
    
    // 소셜 로그인 관련 오류
    'oauth error': '소셜 로그인 중 오류가 발생했습니다.',
    'oauth provider error': '소셜 로그인 제공업체에서 오류가 발생했습니다.',
    'oauth cancelled': '소셜 로그인이 취소되었습니다.',
    
    // 일반적인 오류
    'network error': '네트워크 오류가 발생했습니다.',
    'server error': '서버 오류가 발생했습니다.',
    'unknown error': '알 수 없는 오류가 발생했습니다.',
    'internal error': '내부 오류가 발생했습니다.',
    
    // 특정 상황별 오류
    'user not found': '사용자를 찾을 수 없습니다.',
    'user already exists': '이미 존재하는 사용자입니다.',
    'email already exists': '이미 가입된 이메일 주소입니다.',
    'email not verified': '이메일 인증이 완료되지 않았습니다.',
    'email verification required': '이메일 인증이 필요합니다.',
    
    // 보안 관련 오류
    'too many attempts': '시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'rate limit exceeded': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'captcha required': '보안 확인이 필요합니다.',
    'captcha failed': '보안 확인에 실패했습니다.',
    
    // 도메인 관련 오류
    'domain not allowed': '허용되지 않은 도메인입니다.',
    'email domain not supported': '지원하지 않는 이메일 도메인입니다.',
    
    // 기타 일반적인 오류
    'invalid request': '잘못된 요청입니다.',
    'bad request': '잘못된 요청입니다.',
    'unauthorized': '인증이 필요합니다.',
    'forbidden': '접근이 거부되었습니다.',
    'not found': '요청한 리소스를 찾을 수 없습니다.',
    'method not allowed': '허용되지 않는 메서드입니다.',
    'request timeout': '요청 시간이 초과되었습니다.',
    'service unavailable': '서비스를 사용할 수 없습니다.',
  };
  
  // 정확한 매칭 시도
  for (const [englishError, koreanError] of Object.entries(errorMap)) {
    if (errorLower.includes(englishError.toLowerCase())) {
      return koreanError;
    }
  }
  
  // 부분 매칭 시도
  for (const [englishError, koreanError] of Object.entries(errorMap)) {
    const englishWords = englishError.toLowerCase().split(' ');
    const errorWords = errorLower.split(' ');
    
    if (englishWords.some(word => errorWords.includes(word))) {
      return koreanError;
    }
  }
  
  // 매칭되지 않는 경우 원본 오류 반환하되, 일반적인 영어 오류 메시지인 경우 한글로 변환
  if (error.includes('identifier') && error.includes('invalid')) {
    return '이메일 주소가 올바르지 않습니다.';
  }
  
  if (error.includes('password') && error.includes('invalid')) {
    return '비밀번호가 올바르지 않습니다.';
  }
  
  if (error.includes('verification') && error.includes('code')) {
    return '인증 코드가 올바르지 않습니다.';
  }
  
  if (error.includes('email') && error.includes('already')) {
    return '이미 가입된 이메일 주소입니다.';
  }
  
  if (error.includes('network') || error.includes('connection')) {
    return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (error.includes('server') || error.includes('internal')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  // 기본 오류 메시지
  return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
};

// Clerk 오류 객체에서 메시지를 추출하고 한글로 변환하는 함수
export const handleClerkError = (error: unknown): string => {
  if (error instanceof Error) {
    return translateClerkError(error.message);
  }
  
  if (typeof error === 'string') {
    return translateClerkError(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return translateClerkError(String(error.message));
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};
