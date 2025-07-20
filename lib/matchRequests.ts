import { supabase } from "./supabaseClient";

// 의뢰내역 인터페이스
export interface MatchRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  factoryId: string;
  factoryName: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  items: string[];
  quantity: number;
  description: string;
  contact: string;
  deadline?: string;
  budget?: string;
  additionalInfo?: string;
  additional_info?: string; // Supabase 필드명과 일치
  created_at?: string; // 생성일시
  updated_at?: string; // 수정일시
}

// Supabase에서 공장별 의뢰내역 조회
export async function getMatchRequestsByFactoryId(factoryId: string): Promise<MatchRequest[]> {
  try {
    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .eq('factory_id', factoryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('의뢰내역 조회 중 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('의뢰내역 조회 중 오류:', error);
    return [];
  }
}

// Supabase에서 의뢰내역 상태별 조회
export async function getMatchRequestsByStatus(factoryId: string, status: MatchRequest['status']): Promise<MatchRequest[]> {
  try {
    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .eq('factory_id', factoryId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('의뢰내역 상태별 조회 중 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('의뢰내역 상태별 조회 중 오류:', error);
    return [];
  }
}

// Supabase에서 의뢰내역 상세 조회
export async function getMatchRequestById(requestId: string): Promise<MatchRequest | null> {
  try {
    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('의뢰내역 상세 조회 중 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('의뢰내역 상세 조회 중 오류:', error);
    return null;
  }
}

// Supabase에서 의뢰내역 상태 업데이트
export async function updateMatchRequestStatus(requestId: string, status: MatchRequest['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('match_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      console.error('의뢰내역 상태 업데이트 중 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('의뢰내역 상태 업데이트 중 오류:', error);
    return false;
  }
} 