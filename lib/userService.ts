import { supabase } from './supabaseClient';
import { supabaseService } from './supabaseService';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  loginMethod: 'google' | 'naver' | 'kakao' | 'email';
  externalId?: string;
  kakaoMessageConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  loginMethod: 'google' | 'naver' | 'kakao' | 'email';
  externalId?: string;
  kakaoMessageConsent?: boolean;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  profileImage?: string;
  kakaoMessageConsent?: boolean;
}

// 사용자 생성 또는 업데이트
export async function upsertUser(userData: CreateUserData): Promise<User | null> {
  try {
    const { data: existingUser, error: fetchError } = await supabaseService
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('사용자 조회 오류:', fetchError);
      return null;
    }

    if (existingUser) {
      // 기존 사용자 업데이트
      const { data: updatedUser, error: updateError } = await supabaseService
        .from('users')
        .update({
          name: userData.name,
          phone: userData.phone || existingUser.phone,
          profileImage: userData.profileImage || existingUser.profileImage,
          loginMethod: userData.loginMethod,
          externalId: userData.externalId || existingUser.externalId,
          kakaoMessageConsent: userData.kakaoMessageConsent ?? existingUser.kakaoMessageConsent,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('사용자 업데이트 오류:', updateError);
        return null;
      }

      return updatedUser;
    } else {
      // 새 사용자 생성
      const { data: newUser, error: insertError } = await supabaseService
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          profileImage: userData.profileImage,
          loginMethod: userData.loginMethod,
          externalId: userData.externalId,
          kakaoMessageConsent: userData.kakaoMessageConsent ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('사용자 생성 오류:', insertError);
        return null;
      }

      return newUser;
    }
  } catch (error) {
    console.error('사용자 upsert 오류:', error);
    return null;
  }
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 사용자를 찾을 수 없음
      }
      console.error('사용자 조회 오류:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return null;
  }
}

// 외부 ID로 사용자 조회
export async function getUserByExternalId(externalId: string, loginMethod: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('externalId', externalId)
      .eq('loginMethod', loginMethod)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 사용자를 찾을 수 없음
      }
      console.error('사용자 조회 오류:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return null;
  }
}

// 사용자 정보 업데이트
export async function updateUser(userId: string, updateData: UpdateUserData): Promise<User | null> {
  try {
    const { data: updatedUser, error } = await supabaseService
      .from('users')
      .update({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('사용자 업데이트 오류:', error);
      return null;
    }

    return updatedUser;
  } catch (error) {
    console.error('사용자 업데이트 오류:', error);
    return null;
  }
}

// 사용자 삭제
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseService
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('사용자 삭제 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    return false;
  }
}

// 사용자별 의뢰내역 조회
export async function getUserMatchRequests(userId: string): Promise<any[]> {
  try {
    const { data: requests, error } = await supabaseService
      .from('match_requests')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('의뢰내역 조회 오류:', error);
      return [];
    }

    return requests || [];
  } catch (error) {
    console.error('의뢰내역 조회 오류:', error);
    return [];
  }
}
