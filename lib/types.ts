// 기본 타입 정의
export interface FactoryLocation {
  id: string;
  company_name: string;
  position: {
    lat: number;
    lng: number;
  };
  address: string;
  business_type?: string;
  image?: string;
}

export interface MapViewState {
  center: { lat: number; lng: number };
  level: number;
  selectedFactoryId?: string;
}

export interface MapFilters {
  region?: string;
  businessType?: string;
  searchRadius?: number;
}

// 공장 관련 타입
export interface Factory {
  id: string;
  company_name: string;
  address: string;
  business_type?: string;
  admin_district?: string;
  moq?: number;
  monthly_capacity?: number;
  top_items_upper?: string;
  images?: string[];
  position?: {
    lat: number;
    lng: number;
  };
}

export interface FactoryAuth {
  factoryId: string;
  factoryName: string;
  realName?: string;
}

// 매칭 요청 관련 타입
export interface MatchRequest {
  id: string;
  factory_id: string;
  user_id?: string;
  brand_name: string;
  contact_name: string;
  contact_info: string;
  sample_status: '보유' | '미보유';
  pattern_status: '보유' | '미보유';
  qc_required: '희망' | '미희망';
  finishing_required: '희망' | '미희망';
  packaging_required: '희망' | '미희망';
  files?: string[];
  links?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

// 사용자 관련 타입
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  userType: 'user' | 'factory';
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 에러 타입
export interface AppError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// 폼 데이터 타입
export interface RequestFormData {
  brandName: string;
  name: string;
  contact: string;
  sample: '보유' | '미보유';
  pattern: '보유' | '미보유';
  qc: '희망' | '미희망';
  finishing: '희망' | '미희망';
  packaging: '희망' | '미희망';
  files: File[];
  links: string[];
  agreeToTerms: boolean;
}

// 이미지 관련 타입
export interface ImageUploadResult {
  url: string;
  success: boolean;
  error?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
} 

// 관리자: 팝업/공지 타입
export interface PopupItem {
  id: string;
  title?: string;
  content?: string;
  image_url?: string;
  start_at?: string; // ISO string
  end_at?: string;   // ISO string
  created_at?: string;
  updated_at?: string;
}

export type NoticeCategory = "공지" | "일반" | "채용공고";

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  image_urls?: string[];
  start_at?: string; // 노출 시작
  end_at?: string;   // 노출 종료
  created_at?: string;
  updated_at?: string;
}