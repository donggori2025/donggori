// Clerk 설정 관리
export const clerkConfig = {
  // 허용된 이메일 도메인 목록
  allowedEmailDomains: process.env.CLERK_ALLOWED_EMAIL_DOMAINS 
    ? process.env.CLERK_ALLOWED_EMAIL_DOMAINS.split(',').map(domain => domain.trim())
    : [], // 빈 배열이면 모든 도메인 허용
  
  // 특정 도메인 제한이 있는지 확인
  hasDomainRestriction: process.env.CLERK_ALLOWED_EMAIL_DOMAINS 
    ? process.env.CLERK_ALLOWED_EMAIL_DOMAINS.split(',').length > 0
    : false,
  
  // 특정 도메인이 허용되는지 확인
  isDomainAllowed: (email: string) => {
    if (!clerkConfig.hasDomainRestriction) return true;
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    
    return clerkConfig.allowedEmailDomains.some(allowedDomain => 
      domain === allowedDomain.toLowerCase()
    );
  },
  
  // 도메인 제한 오류 메시지
  getDomainError: (email: string) => {
    if (!clerkConfig.hasDomainRestriction) return null;
    
    const domain = email.split('@')[1];
    if (!domain) return "올바른 이메일 형식을 입력해주세요.";
    
    if (!clerkConfig.isDomainAllowed(email)) {
      return `현재 ${domain} 도메인은 지원되지 않습니다. 지원되는 도메인: ${clerkConfig.allowedEmailDomains.join(', ')}`;
    }
    
    return null;
  }
};

// Clerk 환경 변수 검증
export const validateClerkConfig = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.');
  }

  if (!process.env.CLERK_SECRET_KEY) {
    errors.push('CLERK_SECRET_KEY가 설정되지 않았습니다.');
  }

  // 도메인 제한이 설정되어 있지만 faddit.co.kr이 포함되지 않은 경우 경고
  if (clerkConfig.hasDomainRestriction && !clerkConfig.allowedEmailDomains.includes('faddit.co.kr')) {
    warnings.push('faddit.co.kr 도메인이 허용 목록에 포함되지 않았습니다. Clerk 대시보드에서 확인해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}; 