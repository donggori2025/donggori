"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase, testSupabaseConnection, checkMatchRequestsTable } from "@/lib/supabaseClient";
import { MatchRequest } from "@/lib/matchRequests";
import { Factory } from "@/lib/factories";
import { getFactoryMainImage, getFactoryImages } from "@/lib/factoryImages";
import { validateName } from "@/lib/randomNameGenerator";

const SIDEBAR_MENUS = ["프로필", "문의내역", "의뢰내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

export default function MyPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
  const [naverUser, setNaverUser] = useState<any>(null);
  const [kakaoUser, setKakaoUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // 네이버 사용자 정보 로드
  useEffect(() => {
    setMounted(true);
    
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const naverUserCookie = getCookie('naver_user');
    if (naverUserCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(naverUserCookie));
        setNaverUser(userData);
        console.log('마이페이지에서 네이버 사용자 정보 로드:', userData);
      } catch (error) {
        console.error('네이버 사용자 정보 파싱 오류:', error);
      }
    }

    const kakaoUserCookie = getCookie('kakao_user');
    if (kakaoUserCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(kakaoUserCookie));
        setKakaoUser(userData);
        console.log('마이페이지에서 카카오 사용자 정보 로드:', userData);
      } catch (error) {
        console.error('카카오 사용자 정보 파싱 오류:', error);
      }
    }
  }, []);
  
  // 원본 데이터와 현재 데이터를 분리
  const [originalName, setOriginalName] = useState(user?.firstName || naverUser?.name || kakaoUser?.name || "김한재");
  const [originalEmail, setOriginalEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || naverUser?.email || kakaoUser?.email || "hanjaekim99@gmail.com");
  const [originalPhone, setOriginalPhone] = useState("");
  const [kakaoMessageConsent, setKakaoMessageConsent] = useState(false);
  
  const [name, setName] = useState(originalName);
  const [email, setEmail] = useState(originalEmail);
  const [phone, setPhone] = useState(originalPhone);
  const [nameError, setNameError] = useState<string>("");
  
  // 변경사항이 있는지 확인
  const hasChanges = name !== originalName || email !== originalEmail || phone !== originalPhone || kakaoMessageConsent !== (localStorage.getItem('kakaoMessageConsent') === 'true');

  // 전화번호 형식 검증
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    return phoneRegex.test(phone);
  };

  // 전화번호 자동 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 원본 데이터가 변경되면 현재 데이터도 업데이트
  useEffect(() => {
    const currentName = user?.firstName || naverUser?.name || kakaoUser?.name || "김한재";
    const currentEmail = user?.emailAddresses?.[0]?.emailAddress || naverUser?.email || kakaoUser?.email || "hanjaekim99@gmail.com";
    const currentPhone = localStorage.getItem('userPhone') || "";
    const currentKakaoConsent = localStorage.getItem('kakaoMessageConsent') === 'true';
    
    setOriginalName(currentName);
    setOriginalEmail(currentEmail);
    setOriginalPhone(currentPhone);
    setKakaoMessageConsent(currentKakaoConsent);
    setName(currentName);
    setEmail(currentEmail);
    setPhone(currentPhone);
  }, [user, naverUser, kakaoUser]);

  // 의뢰내역 상태
  const [myMatchRequests, setMyMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (selectedMenu === "의뢰내역" && (user || naverUser || kakaoUser)) {
      setIsLoadingRequests(true);
      setRequestError(null);
      setDebugInfo("");
      
      (async () => {
        try {
          console.log("🔍 의뢰내역 로딩 시작...");
          const userId = user?.id || naverUser?.email || kakaoUser?.email;
          console.log("사용자 ID:", userId);
          
          // 내부 API를 통해 조회 (서비스 키 사용, RLS 영향 없음)
          const res = await fetch(`/api/match-requests?userId=${encodeURIComponent(userId)}`);
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("의뢰내역 조회 오류(API):", err);
            setRequestError(`의뢰내역을 불러오는 중 오류가 발생했습니다: ${res.status} ${res.statusText}`);
            setDebugInfo(err?.error || JSON.stringify(err));
            setMyMatchRequests([]);
          } else {
            const json = await res.json();
            const data = json?.data || [];
            console.log("✅ 의뢰내역 조회 성공(API):", data?.length || 0, "개");
            setMyMatchRequests(data || []);
            setDebugInfo(`성공적으로 ${data?.length || 0}개의 의뢰내역을 불러왔습니다.`);
          }
        } catch (e) {
          console.error("의뢰내역 로딩 중 예외 발생:", e);
          const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다";
          setRequestError(`의뢰내역을 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
          setDebugInfo(`예외 발생: ${errorMessage}`);
          setMyMatchRequests([]);
        } finally {
          setIsLoadingRequests(false);
        }
      })();
    }
  }, [selectedMenu, user, naverUser, kakaoUser]);

  if (!mounted) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로딩 중...</div>;
  }

  if (!user && !naverUser && !kakaoUser) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  const handleSaveChanges = async () => {
    try {
      console.log("업데이트 시작 - 현재 이름:", name);
      console.log("현재 사용자 정보:", user || naverUser || kakaoUser);
      
      if (!user && !naverUser && !kakaoUser) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }
      
      // 이름 유효성 검사
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        setNameError(nameValidation.error || "이름이 올바르지 않습니다.");
        return;
      }
      
      setNameError(""); // 오류 메시지 초기화
      
      if (user) {
        // Clerk 사용자인 경우
        const updatedUser = await user.update({
          firstName: name,
        });
        
        console.log("업데이트된 Clerk 사용자:", updatedUser);
      } else if (naverUser) {
        // 네이버 사용자인 경우 - 쿠키 업데이트
        const updatedNaverUser = {
          ...naverUser,
          name: name,
        };
        
        // 쿠키 업데이트
        document.cookie = `naver_user=${JSON.stringify(updatedNaverUser)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        setNaverUser(updatedNaverUser);
        
        console.log("업데이트된 네이버 사용자:", updatedNaverUser);
      } else if (kakaoUser) {
        // 카카오 사용자인 경우 - 쿠키 업데이트
        const updatedKakaoUser = {
          ...kakaoUser,
          name: name,
        };
        
        // 쿠키 업데이트
        document.cookie = `kakao_user=${JSON.stringify(updatedKakaoUser)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        setKakaoUser(updatedKakaoUser);
        
        console.log("업데이트된 카카오 사용자:", updatedKakaoUser);
      }
      
      // 전화번호 저장
      if (phone && validatePhone(phone)) {
        localStorage.setItem('userPhone', phone);
      }
      
      // 카카오톡 메시지 수신 동의 상태 저장
      localStorage.setItem('kakaoMessageConsent', kakaoMessageConsent.toString());
      
      // 원본 데이터 업데이트
      setOriginalName(name);
      setOriginalEmail(email);
      setOriginalPhone(phone);
      
      alert("변경사항이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 중 오류가 발생했습니다:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      // 오류가 발생해도 로컬 상태는 업데이트
      setOriginalName(name);
      setOriginalEmail(email);
      setOriginalPhone(phone);
      
      alert(`프로필 업데이트에 실패했습니다: ${errorMessage}\n\n로컬 상태는 업데이트되었습니다.`);
    }
  };

  const handleWithdraw = () => {
    if (confirm("정말 탈퇴하시겠습니까?")) {
      // 실제로는 탈퇴 처리
      alert("탈퇴 처리가 완료되었습니다.");
    }
  };

  const handleKakaoMessageConsentWithdrawal = () => {
    if (confirm("카카오톡 메시지 수신 동의를 철회하시겠습니까?\n\n철회 시 즉시 카카오톡 메시지 발송이 중단됩니다.")) {
      setKakaoMessageConsent(false);
      localStorage.setItem('kakaoMessageConsent', 'false');
      alert("카카오톡 메시지 수신 동의가 철회되었습니다.\n\n이메일(donggori2020@gmail.com)을 통한 수신 동의 철회 요청도 가능합니다.");
    }
  };

  const handleKakaoMessageConsentRestore = () => {
    if (confirm("카카오톡 메시지 수신 동의를 다시 설정하시겠습니까?")) {
      setKakaoMessageConsent(true);
      localStorage.setItem('kakaoMessageConsent', 'true');
      alert("카카오톡 메시지 수신 동의가 설정되었습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        // Clerk 사용자인 경우
        await signOut();
      } else if (naverUser) {
        // 네이버 사용자인 경우 - 쿠키 삭제
        document.cookie = "naver_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setNaverUser(null);
      } else if (kakaoUser) {
        // 카카오 사용자인 경우 - 쿠키 삭제
        document.cookie = "kakao_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setKakaoUser(null);
      }
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("파일 크기가 5MB를 초과합니다. 더 작은 파일을 선택해주세요.");
      event.target.value = ''; // 파일 선택 초기화
      return;
    }

    try {
      console.log("이미지 업로드 시작:", file);
      
      if (!user && !naverUser) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      if (user) {
        // Clerk 사용자인 경우
        await user.setProfileImage({ file });
        console.log("Clerk 이미지 업로드 완료");
      } else if (naverUser) {
        // 네이버 사용자인 경우 - 임시로 알림만 표시
        alert("네이버 계정의 프로필 이미지는 네이버에서 직접 변경해주세요.");
        event.target.value = '';
        return;
      } else if (kakaoUser) {
        // 카카오 사용자인 경우 - 임시로 알림만 표시
        alert("카카오 계정의 프로필 이미지는 카카오에서 직접 변경해주세요.");
        event.target.value = '';
        return;
      }
      
      console.log("이미지 업로드 완료");
      alert("프로필 이미지가 업데이트되었습니다.");
      
      // 파일 선택 초기화
      event.target.value = '';
    } catch (error) {
      console.error("이미지 업로드 중 오류가 발생했습니다:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      alert(`이미지 업로드에 실패했습니다: ${errorMessage}`);
      event.target.value = ''; // 파일 선택 초기화
    }
  };

  console.log("Clerk user 객체:", user);
  console.log("네이버 user 객체:", naverUser);

  // 의뢰내역 카드에서 공장 정보 fetch 및 카드 스타일 적용
  function FactoryRequestCard({ req }: { req: MatchRequest }) {
    const [factory, setFactory] = useState<Factory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchFactory() {
        setLoading(true);
        const factoryId = req.factory_id || req.factoryId;
        if (!factoryId) {
          setFactory(null);
          setLoading(false);
          return;
        }
        const { data } = await supabase.from("donggori").select("*").eq("id", factoryId).single();
        
        if (data) {
          // 이미지 매핑 적용
          const companyName = String(data.company_name || data.name || "공장명 없음");
          const mappedFactory: Factory = {
            ...data,
            id: String(data.id || Math.random()),
            name: companyName,
            ownerUserId: String(data.owner_user_id || data.ownerUserId || "unknown"),
            region: String(data.admin_district || data.region || "지역 없음"),
            items: [], // items는 별도 필드들로 구성
            minOrder: Number(data.moq) || 0,
            description: String(data.intro_text || data.intro || data.description || "설명 없음"),
            image: getFactoryMainImage(companyName), // 업장 이름으로 이미지 매칭
            images: getFactoryImages(companyName), // 업장 이름으로 모든 이미지 가져오기
            contact: String(data.phone_num || data.phone_number || data.contact || "연락처 없음"),
            lat: Number(data.lat) || 37.5665,
            lng: Number(data.lng) || 126.9780,
            kakaoUrl: String(data.kakao_url || data.kakaoUrl || ""),
            processes: data.processes ? (Array.isArray(data.processes) ? data.processes as string[] : [String(data.processes)]) : [],
            // DB 연동용 확장 필드들
            business_type: data.business_type as string | undefined,
            equipment: data.equipment as string | undefined,
            sewing_machines: data.sewing_machines as string | undefined,
            pattern_machines: data.pattern_machines as string | undefined,
            special_machines: data.special_machines as string | undefined,
            top_items_upper: data.top_items_upper as string | undefined,
            top_items_lower: data.top_items_lower as string | undefined,
            top_items_outer: data.top_items_outer as string | undefined,
            top_items_dress_skirt: data.top_items_dress_skirt as string | undefined,
            top_items_bag: data.top_items_bag as string | undefined,
            top_items_fashion_accessory: data.top_items_fashion_accessory as string | undefined,
            top_items_underwear: data.top_items_underwear as string | undefined,
            top_items_sports_leisure: data.top_items_sports_leisure as string | undefined,
            top_items_pet: data.top_items_pet as string | undefined,
            moq: Number(data.moq) || undefined,
            monthly_capacity: Number(data.monthly_capacity) || undefined,
            admin_district: data.admin_district as string | undefined,
            intro: (data.intro_text || data.intro) as string | undefined,
            phone_number: (data.phone_num || data.phone_number) as string | undefined,
            factory_type: data.factory_type as string | undefined,
            main_fabrics: data.main_fabrics as string | undefined,
            distribution: data.distribution as string | undefined,
            delivery: data.delivery as string | undefined,
            company_name: data.company_name as string | undefined,
            contact_name: data.contact_name as string | undefined,
            email: data.email as string | undefined,
            address: data.address as string | undefined,
            established_year: Number(data.established_year) || undefined,
          };
          setFactory(mappedFactory);
        } else {
          setFactory(null);
        }
        setLoading(false);
      }
      fetchFactory();
    }, [req.factory_id, req.factoryId]);

    // 상태 뱃지
    const statusBadge = (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
        req.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-300' :
        req.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
        'bg-blue-100 text-blue-700 border-blue-300'
      }`}>
        {req.status === 'pending' ? '대기중' :
         req.status === 'accepted' ? '수락됨' :
         req.status === 'rejected' ? '거절됨' :
         '완료됨'}
      </span>
    );

    if (loading) {
      return (
        <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-[120px] bg-gray-50 text-gray-400">
          공장 정보 불러오는 중...
        </div>
      );
    }

    if (!factory) {
      return (
        <div className="border border-gray-200 rounded-lg p-6 flex items-center min-h-[120px] bg-gray-50">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-700 mb-2">공장 정보 없음</div>
            {statusBadge}
          </div>
        </div>
      );
    }

    // 주요 품목
    const mainItems = [factory.top_items_upper, factory.top_items_lower, factory.top_items_outer, factory.top_items_dress_skirt]
      .filter((v) => typeof v === 'string' && v.length > 0)
      .join(', ') || '-';

    return (
      <div
        className="border border-gray-200 rounded-lg p-6 flex gap-6 items-center"
        // 카드 전체 클릭 이벤트 제거
      >
        <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center group">
          {(factory?.images && factory.images.length > 0 && factory.images[0] && factory.images[0] !== '/logo_donggori.png' && !factory.images[0].includes('logo_donggori')) || 
           (factory?.image && factory.image !== '/logo_donggori.png' && !factory.image.includes('logo_donggori') && !factory.image.includes('unsplash')) ? (
            <Image 
              src={factory.images && factory.images.length > 0 ? factory.images[0] : factory.image} 
              alt={factory?.company_name || factory?.name || '공장 이미지'} 
              width={112} 
              height={112} 
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
              unoptimized
            />
          ) : (
            <div className="text-gray-400 text-xs font-medium text-center">
              이미지<br />준비 중
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900 truncate">{factory?.company_name || factory?.name || '공장명 없음'}</span>
          </div>
          <div className="text-xs text-gray-400 mb-1">의뢰번호: {req.id}</div>
          <div className="text-xs text-gray-500 mb-1">{factory?.business_type || '봉제업'}</div>
          <div className="text-sm text-gray-700 mb-1"><b>주요품목</b>: {mainItems}</div>
          <div className="text-sm text-gray-700 mb-1"><b>MOQ</b>: {factory?.moq || factory?.minOrder || '-'}</div>
          <div className="text-xs text-gray-400">문의일 {req.created_at ? new Date(req.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '날짜 없음'}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {statusBadge}
          <button
            className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-900"
            onClick={() => { window.location.href = `/my-page/requests/${req.id}`; }}
          >상세보기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto py-16 px-4 h-full min-h-[500px]">
      {/* 모바일 탭 메뉴 */}
      <div className="md:hidden mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMenu === menu
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setSelectedMenu(menu)}
            >
              {menu}
            </button>
          ))}
        </div>
        {/* 모바일 로그아웃 버튼 */}
        <div className="mt-4 text-center">
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden md:flex flex-row gap-8 h-full min-h-0">
        {/* 왼쪽 사이드바: 메뉴만 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 flex flex-col self-stretch h-full min-h-0">
          <nav className="w-full flex flex-col gap-2 mb-6">
            {SIDEBAR_MENUS.map((menu) => (
              <button
                key={menu}
                className={`w-full text-left px-4 py-2 rounded transition-colors
                  ${selectedMenu === menu
                    ? "bg-gray-100 text-black font-bold"
                    : "text-gray-700 hover:bg-gray-100"}
                `}
                onClick={() => setSelectedMenu(menu)}
              >
                {menu}
              </button>
            ))}
          </nav>
          {/* 로그아웃 버튼을 맨 아래에 추가 */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </aside>
        {/* 오른쪽 메인 컨텐츠 - border 제거 */}
        <section className="flex-1 bg-white rounded-xl p-8 min-h-0">
          {selectedMenu === "프로필" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">프로필</h2>
              
              {/* 프로필 사진과 이름 */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <Image
                    src={user?.imageUrl || naverUser?.profileImage || "/logo_donggori.png"}
                    alt="프로필 이미지"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold mb-2">{originalName}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    {naverUser ? "네이버 계정으로 로그인됨" : "일반 계정"}
                  </div>
                  <div className="flex gap-4 text-sm">
                    {user && (
                      <>
                        <button className="text-blue-600 hover:underline">사진 삭제</button>
                        <label className="text-blue-600 hover:underline cursor-pointer">
                          사진 업로드
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                    {naverUser && (
                      <span className="text-gray-500 text-sm">네이버 프로필 이미지는 네이버에서 변경해주세요</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 이름 입력 필드 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                  {originalName && originalName.match(/^[가-힣]+[0-9]{2}$/) && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      랜덤 이름
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(""); // 입력 시 오류 메시지 초기화
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                    nameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력해주세요 (2-10자)"
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
                {originalName && originalName.match(/^[가-힣]+[0-9]{2}$/) && (
                  <p className="text-blue-600 text-sm mt-1">
                    💡 OAuth 로그인 시 이름을 받아오지 못해 랜덤 이름이 생성되었습니다. 원하는 이름으로 변경해주세요!
                  </p>
                )}
              </div>

              {/* 이메일 입력 필드 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none text-gray-500"
                  disabled
                />
              </div>

                             {/* 전화번호 입력 필드 */}
               <div className="mb-8">
                 <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                 <input
                   type="text"
                   value={phone}
                   onChange={(e) => setPhone(formatPhone(e.target.value))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                   placeholder="전화번호를 입력해주세요 (예: 010-1234-5678)"
                 />
               </div>

              {/* 카카오톡 메시지 수신 동의 상태 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카카오톡 메시지 수신 동의
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${kakaoMessageConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">
                        {kakaoMessageConsent ? '수신 동의' : '수신 거부'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {kakaoMessageConsent ? '활성화됨' : '비활성화됨'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    • 서비스 안내 및 마케팅 정보를 카카오톡으로 받아보실 수 있습니다.
                    <br />
                    • 언제든지 수신 동의를 철회할 수 있습니다.
                    <br />
                    • 이메일(donggori2020@gmail.com)을 통한 수신 동의 철회 요청도 가능합니다.
                  </div>
                  <div className="flex gap-2">
                    {kakaoMessageConsent ? (
                      <button
                        onClick={handleKakaoMessageConsentWithdrawal}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        수신 동의 철회
                      </button>
                    ) : (
                      <button
                        onClick={handleKakaoMessageConsentRestore}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        수신 동의 설정
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 하단 버튼들 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleWithdraw}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  탈퇴하기
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    hasChanges 
                      ? "bg-black hover:bg-gray-800 text-white" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  변경사항 저장
                </button>
              </div>
            </div>
          )}

          {selectedMenu === "문의내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">문의내역</h2>
              <div className="text-center py-20 text-gray-400 text-lg">
                문의내역이 없습니다.
              </div>
            </div>
          )}

          {selectedMenu === "의뢰내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">의뢰내역</h2>
              {isLoadingRequests ? (
                <div className="text-center py-20 text-gray-400 text-lg">의뢰내역을 불러오는 중...</div>
              ) : requestError ? (
                <div className="text-center py-20">
                  <div className="text-red-500 text-lg mb-4">{requestError}</div>
                  {debugInfo && (
                    <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto">
                      <div className="font-semibold mb-2">디버그 정보:</div>
                      <div className="text-xs">{debugInfo}</div>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    <div>• 브라우저 개발자 도구(F12)의 Console 탭에서 더 자세한 오류 정보를 확인할 수 있습니다.</div>
                    <div>• 환경 변수가 올바르게 설정되어 있는지 확인해주세요.</div>
                  </div>
                </div>
              ) : myMatchRequests.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg">의뢰내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {myMatchRequests.map((req) => (
                    <FactoryRequestCard key={req.id} req={req} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 모바일 메인 컨텐츠 */}
      <div className="md:hidden bg-white rounded-xl p-6">
        {selectedMenu === "프로필" && (
          <div>
            <h2 className="text-xl font-bold mb-6">프로필</h2>
            
            {/* 프로필 사진과 이름 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                                  <Image
                    src={user?.imageUrl || naverUser?.profileImage || kakaoUser?.profileImage || "/logo_donggori.png"}
                    alt="프로필 이미지"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold mb-2">{originalName}</div>
                                  <div className="text-sm text-gray-600 mb-2">
                    {naverUser ? "네이버 계정으로 로그인됨" : kakaoUser ? "카카오 계정으로 로그인됨" : "일반 계정"}
                  </div>
                <div className="flex gap-4 text-sm">
                  {user && (
                    <>
                      <button className="text-blue-600 hover:underline">사진 삭제</button>
                      <label className="text-blue-600 hover:underline cursor-pointer">
                        사진 업로드
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                  {naverUser && (
                    <span className="text-gray-500 text-sm">네이버 프로필 이미지는 네이버에서 변경해주세요</span>
                  )}
                  {kakaoUser && (
                    <span className="text-gray-500 text-sm">카카오 프로필 이미지는 카카오에서 변경해주세요</span>
                  )}
                </div>
              </div>
            </div>

            {/* 이름 입력 필드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
                {originalName && originalName.match(/^[가-힣]+[0-9]{2}$/) && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    랜덤 이름
                  </span>
                )}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(""); // 입력 시 오류 메시지 초기화
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="이름을 입력해주세요 (2-10자)"
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
              {originalName && originalName.match(/^[가-힣]+[0-9]{2}$/) && (
                <p className="text-blue-600 text-sm mt-1">
                  💡 OAuth 로그인 시 이름을 받아오지 못해 랜덤 이름이 생성되었습니다. 원하는 이름으로 변경해주세요!
                </p>
              )}
            </div>

            {/* 이메일 입력 필드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none text-gray-500"
                disabled
              />
            </div>

                         {/* 전화번호 입력 필드 */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
               <input
                 type="text"
                 value={phone}
                 onChange={(e) => setPhone(formatPhone(e.target.value))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                 placeholder="전화번호를 입력해주세요 (예: 010-1234-5678)"
               />
             </div>

            {/* 카카오톡 메시지 수신 동의 상태 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카카오톡 메시지 수신 동의
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${kakaoMessageConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {kakaoMessageConsent ? '수신 동의' : '수신 거부'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {kakaoMessageConsent ? '활성화됨' : '비활성화됨'}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  • 서비스 안내 및 마케팅 정보를 카카오톡으로 받아보실 수 있습니다.
                  <br />
                  • 언제든지 수신 동의를 철회할 수 있습니다.
                  <br />
                  • 이메일(donggori2020@gmail.com)을 통한 수신 동의 철회 요청도 가능합니다.
                </div>
                <div className="flex gap-2">
                  {kakaoMessageConsent ? (
                    <button
                      onClick={handleKakaoMessageConsentWithdrawal}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      수신 동의 철회
                    </button>
                  ) : (
                    <button
                      onClick={handleKakaoMessageConsentRestore}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      수신 동의 설정
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 버튼들 */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleWithdraw}
                className="text-red-600 hover:text-red-800 transition-colors text-sm"
              >
                탈퇴하기
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  hasChanges 
                    ? "bg-black hover:bg-gray-800 text-white" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                변경사항 저장
              </button>
            </div>
          </div>
        )}

        {selectedMenu === "문의내역" && (
          <div>
            <h2 className="text-xl font-bold mb-6">문의내역</h2>
            <div className="text-center py-16 text-gray-400 text-lg">
              문의내역이 없습니다.
            </div>
          </div>
        )}

        {selectedMenu === "의뢰내역" && (
          <div>
            <h2 className="text-xl font-bold mb-6">의뢰내역</h2>
            {isLoadingRequests ? (
              <div className="text-center py-16 text-gray-400 text-lg">의뢰내역을 불러오는 중...</div>
            ) : requestError ? (
              <div className="text-center py-16">
                <div className="text-red-500 text-lg mb-4">{requestError}</div>
                {debugInfo && (
                  <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
                    <div className="font-semibold mb-2">디버그 정보:</div>
                    <div className="text-xs">{debugInfo}</div>
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  <div>• 브라우저 개발자 도구(F12)의 Console 탭에서 더 자세한 오류 정보를 확인할 수 있습니다.</div>
                  <div>• 환경 변수가 올바르게 설정되어 있는지 확인해주세요.</div>
                </div>
              </div>
            ) : myMatchRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-lg">의뢰내역이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {myMatchRequests.map((req) => (
                  <FactoryRequestCard key={req.id} req={req} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 