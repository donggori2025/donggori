import { supabase } from "./supabaseClient";

// 봉제공장 업장별 로그인 정보
export interface FactoryAuth {
  id: string;
  factoryId: string;
  username: string;
  password: string;
  factoryName: string;
}

// 봉제공장 업장별 로그인 정보 (실제 서비스에서는 DB에서 관리)
export const factoryAuthData: FactoryAuth[] = [];

// 70개 봉제공장 인증 정보 생성
for (let i = 1; i <= 70; i++) {
  const factoryNumber = i.toString().padStart(2, '0');
  factoryAuthData.push({
    id: i.toString(),
    factoryId: i.toString(),
    username: `factory${factoryNumber}`,
    password: `factory${factoryNumber}!`,
    factoryName: `봉제공장${factoryNumber}` // 기본값, 실제로는 DB에서 가져온 company_name 사용
  });
}

// 봉제공장 로그인 검증 함수
export function validateFactoryLogin(username: string, password: string): FactoryAuth | null {
  const factory = factoryAuthData.find(
    auth => auth.username === username && auth.password === password
  );
  return factory || null;
}

// 공장 로그인 시 실제 DB 공장명으로 업데이트
export async function getFactoryAuthWithRealName(username: string, password: string): Promise<FactoryAuth | null> {
  const factory = validateFactoryLogin(username, password);
  if (!factory) return null;

  try {
    // DB에서 실제 공장명 가져오기
    const { data, error } = await supabase
      .from('donggori')
      .select('company_name, name')
      .eq('id', factory.factoryId)
      .single();

    if (error) {
      console.error('공장명 조회 중 오류:', error);
      // DB 오류 시 실제 공장명 매핑 사용
      return {
        ...factory,
        factoryName: getRealFactoryName(factory.factoryId)
      };
    }

    // 실제 공장명으로 업데이트 (DB company_name 우선, name, 매핑 순)
    const realFactoryName = data?.company_name || data?.name || getRealFactoryName(factory.factoryId);
    return {
      ...factory,
      factoryName: realFactoryName
    };
  } catch (error) {
    console.error('공장명 조회 중 오류:', error);
    // 오류 시 실제 공장명 매핑 사용
    return {
      ...factory,
      factoryName: getRealFactoryName(factory.factoryId)
    };
  }
}

// 봉제공장 ID로 인증 정보 찾기
export function getFactoryAuthByFactoryId(factoryId: string): FactoryAuth | null {
  return factoryAuthData.find(auth => auth.factoryId === factoryId) || null;
}

// 봉제공장 인증 정보로 공장 정보 찾기
export function getFactoryAuthByUsername(username: string): FactoryAuth | null {
  return factoryAuthData.find(auth => auth.username === username) || null;
}

// Supabase에서 실제 봉제공장 데이터 가져오기
export async function getFactoryDataFromDB(factoryId: string) {
  try {
    console.log('공장 데이터 조회 시작 - factoryId:', factoryId);
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .eq('id', factoryId)
      .single();

    if (error) {
      console.error('공장 데이터 조회 중 오류:', error);
      return null;
    }

    console.log('공장 데이터 조회 성공:', data);
    return data;
  } catch (error) {
    console.error('공장 데이터 조회 중 오류:', error);
    return null;
  }
}

// Supabase에서 모든 봉제공장 데이터 가져오기
export async function getAllFactoriesFromDB() {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .order('id');

    if (error) {
      console.error('공장 데이터 조회 중 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('공장 데이터 조회 중 오류:', error);
    return [];
  }
}

// 실제 공장명 가져오기 (DB에서)
export async function getFactoryNameFromDB(factoryId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('company_name, name')
      .eq('id', factoryId)
      .single();

    if (error) {
      console.error('공장명 조회 중 오류:', error);
      return null;
    }

    // company_name이 있으면 사용, 없으면 name 사용
    return data?.company_name || data?.name || null;
  } catch (error) {
    console.error('공장명 조회 중 오류:', error);
    return null;
  }
}

// 공장 ID에 따른 실제 공장명 매핑
export function getRealFactoryName(factoryId: string): string {
  const factoryNames: { [key: string]: string } = {
    '1': '재민상사',
    '2': '동대문봉제공장',
    '3': '서울패션공장',
    '4': '한국봉제공장',
    '5': '대한봉제공장',
    '6': '미래봉제공장',
    '7': '신세계봉제공장',
    '8': '현대봉제공장',
    '9': '삼성봉제공장',
    '10': 'LG봉제공장',
    '11': '포스코봉제공장',
    '12': 'SK봉제공장',
    '13': '현대자동차봉제공장',
    '14': '기아봉제공장',
    '15': '현대모비스봉제공장',
    '16': '한화봉제공장',
    '17': '롯데봉제공장',
    '18': 'CJ봉제공장',
    '19': 'GS봉제공장',
    '20': 'KT봉제공장',
    '21': 'SK하이닉스봉제공장',
    '22': '삼성전자봉제공장',
    '23': 'LG전자봉제공장',
    '24': '현대중공업봉제공장',
    '25': '두산봉제공장',
    '26': '한진봉제공장',
    '27': '아시아나봉제공장',
    '28': '대한항공봉제공장',
    '29': '코리아나봉제공장',
    '30': '아모레퍼시픽봉제공장',
    '31': 'LG화학봉제공장',
    '32': '포스코홀딩스봉제공장',
    '33': 'SK이노베이션봉제공장',
    '34': '현대글로비스봉제공장',
    '35': '한화에어로스페이스봉제공장',
    '36': '두산에너빌리티봉제공장',
    '37': '한화생명봉제공장',
    '38': '교보생명봉제공장',
    '39': '삼성생명봉제공장',
    '40': '한국생명봉제공장',
    '41': '동양생명봉제공장',
    '42': '교보증권봉제공장',
    '43': '미래에셋증권봉제공장',
    '44': '한국투자증권봉제공장',
    '45': 'NH투자증권봉제공장',
    '46': '키움증권봉제공장',
    '47': '대우증권봉제공장',
    '48': '신한투자증권봉제공장',
    '49': '하나증권봉제공장',
    '50': '한국스탠다드차타드은행봉제공장',
    '51': '신한은행봉제공장',
    '52': '하나은행봉제공장',
    '53': '국민은행봉제공장',
    '54': '우리은행봉제공장',
    '55': '기업은행봉제공장',
    '56': '농협은행봉제공장',
    '57': '수협은행봉제공장',
    '58': '카카오뱅크봉제공장',
    '59': '토스뱅크봉제공장',
    '60': '네이버뱅크봉제공장',
    '61': '쿠팡봉제공장',
    '62': '배달의민족봉제공장',
    '63': '카카오봉제공장',
    '64': '네이버봉제공장',
    '65': '구글봉제공장',
    '66': '페이스북봉제공장',
    '67': '애플봉제공장',
    '68': '마이크로소프트봉제공장',
    '69': '아마존봉제공장',
    '70': '테슬라봉제공장'
  };

  return factoryNames[factoryId] || `봉제공장${factoryId}`;
}

// 공장 정보 업데이트 (DB에)
export async function updateFactoryData(factoryId: string, updateData: { [key: string]: unknown }) {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .update(updateData)
      .eq('id', factoryId)
      .select()
      .single();

    if (error) {
      console.error('공장 정보 업데이트 중 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('공장 정보 업데이트 중 오류:', error);
    return null;
  }
}

// 공장 이미지 배열 가져오기
export async function getFactoryImages(factoryId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('images')
      .eq('id', factoryId)
      .single();

    if (error) {
      console.error('공장 이미지 조회 중 오류:', error);
      return [];
    }

    return data?.images || [];
  } catch (error) {
    console.error('공장 이미지 조회 중 오류:', error);
    return [];
  }
}

// 공장 이미지 업데이트
export async function updateFactoryImages(factoryId: string, images: string[]) {
  try {
    const { data, error } = await supabase
      .from('donggori')
      .update({ images })
      .eq('id', factoryId)
      .select()
      .single();

    if (error) {
      console.error('공장 이미지 업데이트 중 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('공장 이미지 업데이트 중 오류:', error);
    return null;
  }
}

// 공장 첫 번째 이미지 가져오기 (헤더 프로필 이미지용)
export async function getFactoryProfileImage(factoryId: string): Promise<string | null> {
  try {
    const images = await getFactoryImages(factoryId);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error('공장 프로필 이미지 조회 중 오류:', error);
    return null;
  }
}

// 파일을 Supabase Storage에 업로드
export async function uploadFactoryImage(file: File, factoryId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${factoryId}_${Date.now()}.${fileExt}`;
    const filePath = `factory-images/${fileName}`;

    const { error } = await supabase.storage
      .from('factory-images')
      .upload(filePath, file);

    if (error) {
      console.error('이미지 업로드 중 오류:', error);
      return null;
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('factory-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 중 오류:', error);
    return null;
  }
}

// Supabase Storage에서 이미지 삭제
export async function deleteFactoryImage(imageUrl: string): Promise<boolean> {
  try {
    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `factory-images/${fileName}`;

    const { error } = await supabase.storage
      .from('factory-images')
      .remove([filePath]);

    if (error) {
      console.error('이미지 삭제 중 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('이미지 삭제 중 오류:', error);
    return false;
  }
} 