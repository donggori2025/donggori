import { supabase } from "./supabaseClient";

// 의뢰내역 인터페이스
export interface MatchRequest {
  id: string;
  userId?: string;
  user_id?: string; // Supabase 필드명과 일치
  userEmail?: string;
  user_email?: string; // Supabase 필드명과 일치
  userName?: string;
  user_name?: string; // Supabase 필드명과 일치
  factoryId?: string;
  factory_id?: string; // Supabase 필드명과 일치
  factoryName?: string;
  factory_name?: string; // Supabase 필드명과 일치
  requestDate?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  items: string[];
  quantity: number;
  description: string;
  contact: string;
  deadline?: string;
  budget?: string;
  additionalInfo?: string;
  additional_info?: string; // Supabase 필드명과 일치
  created_at?: string; // Supabase 필드명과 일치
  updated_at?: string; // Supabase 필드명과 일치
}

// Supabase에서 공장별 의뢰내역 조회
export async function getMatchRequestsByFactoryId(factoryId: string): Promise<MatchRequest[]> {
  try {
    const res = await fetch(`/api/match-requests?factoryId=${encodeURIComponent(factoryId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('의뢰내역 조회 중 오류(API):', err);
      return [];
    }
    const json = await res.json();
    return json?.data || [];
  } catch (error) {
    console.error('의뢰내역 조회 중 오류:', error);
    return [];
  }
}

// Supabase에서 의뢰내역 상태별 조회
export async function getMatchRequestsByStatus(factoryId: string, status: MatchRequest['status']): Promise<MatchRequest[]> {
  try {
    const res = await fetch(`/api/match-requests?factoryId=${encodeURIComponent(factoryId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('의뢰내역 상태별 조회 중 오류(API):', err);
      return [];
    }
    const json = await res.json();
    const all = (json?.data || []) as MatchRequest[];
    return all.filter((r) => r.status === status);
  } catch (error) {
    console.error('의뢰내역 상태별 조회 중 오류:', error);
    return [];
  }
}

// Supabase에서 의뢰내역 상세 조회
export async function getMatchRequestById(requestId: string): Promise<MatchRequest | null> {
  try {
    const res = await fetch(`/api/match-requests?id=${encodeURIComponent(requestId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('의뢰내역 상세 조회 중 오류(API):', err);
      return null;
    }
    const json = await res.json();
    const data = json?.data || [];
    return Array.isArray(data) ? (data[0] || null) : data || null;
  } catch (error) {
    console.error('의뢰내역 상세 조회 중 오류:', error);
    return null;
  }
}

// Supabase에서 의뢰내역 상태 업데이트
export async function updateMatchRequestStatus(requestId: string, status: MatchRequest['status']): Promise<boolean> {
  try {
    const res = await fetch('/api/match-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: requestId, status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('의뢰내역 상태 업데이트 중 오류(API):', err);
      return false;
    }
    return true;
  } catch (error) {
    console.error('의뢰내역 상태 업데이트 중 오류:', error);
    return false;
  }
}