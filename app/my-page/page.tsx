"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUnifiedUser } from "@/lib/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { MatchRequest } from "@/lib/matchRequests";
import { Factory } from "@/lib/factories";
import { getFactoryMainImage, getFactoryImages } from "@/lib/factoryImages";
import MyPageLayout from "@/components/MyPageLayout";
import Image from "next/image";

export default function MyPage() {
  const { user: clerkUser } = useUser();
  const { user: unifiedUser, loading, updateUser, logout, isLoggedIn } = useUnifiedUser();
  
  // 사용자 정보 결정 (통합 시스템 우선)
  const currentUser = unifiedUser || clerkUser;
  const isUserLoggedIn = clerkUser || isLoggedIn;

  // 폼 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [kakaoMessageConsent, setKakaoMessageConsent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 의뢰내역 상태
  const [myMatchRequests, setMyMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("프로필");

  // 사용자 정보 로드
  useEffect(() => {
    if (currentUser) {
      // Clerk 사용자와 통합 사용자 타입 처리
      const userName = unifiedUser?.name || clerkUser?.firstName || "";
      const userEmail = unifiedUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "";
      const userPhone = unifiedUser?.phone || "";
      const userKakaoConsent = unifiedUser?.kakaoMessageConsent || false;
      
      setName(userName);
      setEmail(userEmail);
      setPhone(userPhone);
      setKakaoMessageConsent(userKakaoConsent);
    }
  }, [currentUser, unifiedUser, clerkUser]);

  // 의뢰내역 로드
  useEffect(() => {
    if (selectedMenu === "의뢰내역" && currentUser) {
      loadMatchRequests();
    }
  }, [selectedMenu, currentUser]);

  const loadMatchRequests = async () => {
    if (!currentUser) return;

    setIsLoadingRequests(true);
    try {
      const userId = unifiedUser?.id || clerkUser?.id || unifiedUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (!userId) {
        setMyMatchRequests([]);
        return;
      }
      
      const res = await fetch(`/api/match-requests?userId=${encodeURIComponent(userId)}`);
      
      if (res.ok) {
        const { data } = await res.json();
        setMyMatchRequests(data || []);
      } else {
        console.error("의뢰내역 로드 실패:", res.statusText);
        setMyMatchRequests([]);
      }
    } catch (error) {
      console.error("의뢰내역 로드 오류:", error);
      setMyMatchRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const success = await updateUser({
        name,
        phone,
        kakaoMessageConsent
      });

      if (success) {
        setIsEditing(false);
        alert("정보가 성공적으로 저장되었습니다.");
      } else {
        alert("정보 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("정보 저장 오류:", error);
      alert("정보 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // 로그인 체크
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">마이페이지를 이용하려면 로그인해주세요.</p>
          <a
            href="/sign-in"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            로그인하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <MyPageLayout>
      {selectedMenu === "프로필" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <Image
                  src={unifiedUser?.profileImage || clerkUser?.imageUrl || "/logo_donggori.png"}
                  alt="프로필 이미지"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-gray-600">{email}</p>
                <p className="text-sm text-gray-500">
                  {unifiedUser?.loginMethod === 'google' && '구글 계정으로 로그인됨'}
                  {unifiedUser?.loginMethod === 'naver' && '네이버 계정으로 로그인됨'}
                  {unifiedUser?.loginMethod === 'kakao' && '카카오 계정으로 로그인됨'}
                  {!unifiedUser && clerkUser && '구글 계정으로 로그인됨'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                ) : (
                  <p className="text-gray-900">{name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-gray-900">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                ) : (
                  <p className="text-gray-900">{phone || "미입력"}</p>
                )}
              </div>

              {unifiedUser?.loginMethod === 'kakao' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카카오톡 메시지 수신 동의
                  </label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="kakaoMessageConsent"
                        checked={kakaoMessageConsent}
                        onChange={(e) => setKakaoMessageConsent(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="kakaoMessageConsent" className="text-sm text-gray-700">
                        카카오톡으로 봉제공장 매칭 결과를 받겠습니다
                      </label>
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {kakaoMessageConsent ? "동의함" : "동의하지 않음"}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    정보 수정
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMenu === "의뢰내역" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">내 의뢰내역</h2>
          
          {isLoadingRequests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : myMatchRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">아직 의뢰내역이 없습니다.</p>
              <a
                href="/factories"
                className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                봉제공장 찾아보기
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {myMatchRequests.map((request) => (
                <FactoryRequestCard key={request.id} req={request} />
              ))}
            </div>
          )}
        </div>
      )}
    </MyPageLayout>
  );
}

// 의뢰내역 카드 컴포넌트
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
        const companyName = String(data.company_name || data.name || "공장명 없음");
        const mappedFactory: Factory = {
          ...data,
          id: String(data.id || Math.random()),
          name: companyName,
          ownerUserId: String(data.owner_user_id || data.ownerUserId || "unknown"),
          region: String(data.admin_district || data.region || "지역 없음"),
          items: [],
          minOrder: Number(data.moq) || 0,
          description: String(data.intro_text || data.intro || data.description || "설명 없음"),
          image: getFactoryMainImage(companyName),
          images: getFactoryImages(companyName),
          contact: String(data.phone_num || data.phone_number || data.contact || "연락처 없음"),
          lat: Number(data.lat) || 37.5665,
          lng: Number(data.lng) || 126.9780,
          kakaoUrl: String(data.kakao_url || data.kakaoUrl || ""),
          processes: data.processes ? (Array.isArray(data.processes) ? data.processes as string[] : [String(data.processes)]) : [],
          business_type: data.business_type as string | undefined,
          equipment: data.equipment as string | undefined,
        };
        setFactory(mappedFactory);
      }
      setLoading(false);
    }
    
    fetchFactory();
  }, [req.factory_id, req.factoryId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: "검토중", color: "bg-yellow-100 text-yellow-800" },
      accepted: { text: "승인됨", color: "bg-green-100 text-green-800" },
      rejected: { text: "거절됨", color: "bg-red-100 text-red-800" },
      completed: { text: "완료", color: "bg-blue-100 text-blue-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{factory?.name || "공장명 없음"}</h3>
          <p className="text-gray-600">{factory?.region}</p>
        </div>
        {getStatusBadge(req.status)}
      </div>
      
      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>연락처:</strong> {req.contact}</p>
        <p><strong>의뢰일:</strong> {new Date(req.created_at || "").toLocaleDateString()}</p>
        {req.description && (
          <p><strong>설명:</strong> {req.description}</p>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href={`/factories/${factory?.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          공장 상세보기 →
        </a>
      </div>
    </div>
  );
} 