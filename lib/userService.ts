import { supabase } from './supabaseClient';

export interface CreateUserData {
  email: string;
  name: string;
  phoneNumber: string;
  password?: string;
  profileImage?: string;
  signupMethod: 'email' | 'kakao' | 'naver' | 'google';
  externalId?: string;
  kakaoMessageConsent?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  password?: string;
  profileImage?: string;
  signupMethod: string;
  externalId?: string;
  kakaoMessageConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

// 전화번호 중복 체크
export async function checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('phoneNumber', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때의 오류
      console.error('전화번호 중복 체크 오류:', error);
      throw error;
    }

    return !!data; // 데이터가 있으면 true, 없으면 false
  } catch (error) {
    console.error('전화번호 중복 체크 중 오류:', error);
    throw error;
  }
}

// 이메일 중복 체크
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('이메일 중복 체크 오류:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('이메일 중복 체크 중 오류:', error);
    throw error;
  }
}

// 사용자 생성
export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    // 전화번호 중복 체크
    const phoneExists = await checkPhoneNumberExists(userData.phoneNumber);
    if (phoneExists) {
      throw new Error('이미 등록된 전화번호입니다. 다른 전화번호를 사용해주세요.');
    }

    // 이메일 중복 체크
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error('이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        profileImage: userData.profileImage,
        signupMethod: userData.signupMethod,
        externalId: userData.externalId,
        kakaoMessageConsent: userData.kakaoMessageConsent || false,
      }])
      .select()
      .single();

    if (error) {
      console.error('사용자 생성 오류:', error);
      
      // Supabase 제약 조건 오류 처리
      if (error.code === '23505') {
        if (error.message.includes('phoneNumber')) {
          throw new Error('이미 등록된 전화번호입니다. 다른 전화번호를 사용해주세요.');
        } else if (error.message.includes('email')) {
          throw new Error('이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        }
      }
      
      throw new Error('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }

    return data as User;
  } catch (error) {
    console.error('사용자 생성 중 오류:', error);
    throw error;
  }
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('사용자 조회 오류:', error);
      throw error;
    }

    return data as User | null;
  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    throw error;
  }
}

// 전화번호로 사용자 조회
export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phoneNumber', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('사용자 조회 오류:', error);
      throw error;
    }

    return data as User | null;
  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    throw error;
  }
}

// 외부 ID로 사용자 조회 (소셜 로그인용)
export async function getUserByExternalId(externalId: string, signupMethod: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('externalId', externalId)
      .eq('signupMethod', signupMethod)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('사용자 조회 오류:', error);
      throw error;
    }

    return data as User | null;
  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    throw error;
  }
}

// 사용자 정보 업데이트
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('사용자 업데이트 오류:', error);
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('사용자 업데이트 중 오류:', error);
    throw error;
  }
}
