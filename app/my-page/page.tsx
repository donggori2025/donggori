"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase, testSupabaseConnection, checkMatchRequestsTable } from "@/lib/supabaseClient";
import { MatchRequest } from "@/lib/matchRequests";
import { Factory } from "@/lib/factories";

const SIDEBAR_MENUS = ["프로필", "문의내역", "의뢰내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

export default function MyPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
  
  // 원본 데이터와 현재 데이터를 분리
  const [originalName, setOriginalName] = useState(user?.firstName || "김한재");
  const [originalEmail, setOriginalEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "hanjaekim99@gmail.com");
  
  const [name, setName] = useState(originalName);
  const [email, setEmail] = useState(originalEmail);
  
  // 변경사항이 있는지 확인
  const hasChanges = name !== originalName || email !== originalEmail;

  // 원본 데이터가 변경되면 현재 데이터도 업데이트
  useEffect(() => {
    setOriginalName(user?.firstName || "김한재");
    setOriginalEmail(user?.emailAddresses?.[0]?.emailAddress || "hanjaekim99@gmail.com");
    setName(user?.firstName || "김한재");
    setEmail(user?.emailAddresses?.[0]?.emailAddress || "hanjaekim99@gmail.com");
  }, [user]);

  // 의뢰내역 상태
  const [myMatchRequests, setMyMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (selectedMenu === "의뢰내역" && user) {
      setIsLoadingRequests(true);
      setRequestError(null);
      setDebugInfo("");
      
      (async () => {
        try {
          console.log("🔍 의뢰내역 로딩 시작...");
          console.log("사용자 ID:", user.id);
          
          // 환경 변수 확인
          console.log("환경 변수 확인:");
          console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 설정됨" : "❌ 설정되지 않음");
          console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 설정됨" : "❌ 설정되지 않음");
          
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setRequestError("환경 변수가 설정되지 않았습니다. 관리자에게 문의해주세요.");
            setDebugInfo("환경 변수 오류: Supabase URL 또는 Anon Key가 설정되지 않음");
            setMyMatchRequests([]);
            return;
          }
          
          // Supabase 연결 테스트
          const connectionTest = await testSupabaseConnection();
          console.log("Supabase 연결 테스트 결과:", connectionTest);
          
          if (!connectionTest.success) {
            setRequestError(`Supabase 연결 실패: ${connectionTest.error}`);
            setDebugInfo(`연결 오류: ${connectionTest.error}`);
            setMyMatchRequests([]);
            return;
          }
          
          console.log("✅ Supabase 연결 성공");
          
          // match_requests 테이블 확인
          const tableTest = await checkMatchRequestsTable();
          console.log("match_requests 테이블 확인 결과:", tableTest);
          
          if (!tableTest.success) {
            setRequestError(`match_requests 테이블 접근 실패: ${tableTest.error}`);
            setDebugInfo(`테이블 오류: ${tableTest.error}`);
            setMyMatchRequests([]);
            return;
          }
          
          console.log("✅ match_requests 테이블 접근 성공, 의뢰내역 조회 시작...");
          
          // 직접 fetch를 사용하여 의뢰내역 조회
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/match_requests?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc`,
            {
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log("Fetch 응답 상태:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("의뢰내역 조회 오류:", response.status, errorText);
            setRequestError(`의뢰내역을 불러오는 중 오류가 발생했습니다: ${response.status} ${response.statusText}`);
            setDebugInfo(`HTTP 오류: ${response.status} - ${errorText}`);
            setMyMatchRequests([]);
          } else {
            const data = await response.json();
            console.log("✅ 의뢰내역 조회 성공:", data?.length || 0, "개");
            setMyMatchRequests(data || []);
            setDebugInfo(`성공적으로 ${data?.length || 0}개의 의뢰내역을 불러왔습니다.`);
          }
        } catch (e) {
          console.error("의뢰내역 로딩 중 예외 발생:", e);
          const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류";
          setRequestError(`의뢰내역을 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
          setDebugInfo(`예외 발생: ${errorMessage}`);
          setMyMatchRequests([]);
        } finally {
          setIsLoadingRequests(false);
        }
      })();
    }
  }, [selectedMenu, user]);

  if (!user) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  const handleSaveChanges = async () => {
    try {
      console.log("업데이트 시작 - 현재 이름:", name);
      console.log("현재 사용자 정보:", user);
      
      if (!user) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }
      
      // Clerk를 사용하여 사용자 정보 업데이트
      const updatedUser = await user.update({
        firstName: name,
      });
      
      console.log("업데이트된 사용자:", updatedUser);
      
      // 원본 데이터 업데이트
      setOriginalName(name);
      setOriginalEmail(email);
      
      alert("변경사항이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 중 오류가 발생했습니다:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      // 오류가 발생해도 로컬 상태는 업데이트
      setOriginalName(name);
      setOriginalEmail(email);
      
      alert(`프로필 업데이트에 실패했습니다: ${errorMessage}\n\n로컬 상태는 업데이트되었습니다.`);
    }
  };

  const handleWithdraw = () => {
    if (confirm("정말 탈퇴하시겠습니까?")) {
      // 실제로는 탈퇴 처리
      alert("탈퇴 처리가 완료되었습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
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
      
      if (!user) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // Clerk를 사용하여 프로필 이미지 업데이트
      await user.setProfileImage({ file });
      
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
        setFactory(data);
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
        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex gap-6 items-center"
        // 카드 전체 클릭 이벤트 제거
      >
        <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          <Image src={factory?.image || factory?.images?.[0] || "/logo_donggori.png"} alt={factory?.company_name || factory?.name || '공장 이미지'} width={112} height={112} className="object-cover w-full h-full" />
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
    <div className="max-w-[1200px] mx-auto py-16 px-4 h-full flex flex-row gap-8 min-h-[500px]">
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
                  src={user.imageUrl}
                  alt="프로필 이미지"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold mb-2">{originalName}</div>
                <div className="flex gap-4 text-sm">
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
                </div>
              </div>
            </div>

            {/* 이름 입력 필드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
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
  );
} 