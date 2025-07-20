"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFactoryAuthByFactoryId, getFactoryDataFromDB, updateFactoryData, getRealFactoryName, getFactoryImages, updateFactoryImages, uploadFactoryImage, deleteFactoryImage } from "@/lib/factoryAuth";
import { getMatchRequestsByFactoryId, updateMatchRequestStatus, MatchRequest } from "@/lib/matchRequests";

const SIDEBAR_MENUS = ["프로필", "문의내역", "의뢰내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

export default function FactoryMyPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
  const [factoryAuth, setFactoryAuth] = useState<any>(null);
  const [factoryData, setFactoryData] = useState<any>(null);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 데이터 상태
  const [originalData, setOriginalData] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  
  // 이미지 관리 상태
  const [factoryImages, setFactoryImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 로컬스토리지에서 봉제공장 인증 정보 가져오기
        const storedAuth = localStorage.getItem('factoryAuth');
        const userType = localStorage.getItem('userType');
        
        console.log('Stored auth:', storedAuth);
        console.log('User type:', userType);
        
        if (!storedAuth || userType !== 'factory') {
          console.log('No auth or wrong user type, redirecting to sign-in');
          router.push('/sign-in');
          return;
        }
        
        const auth = JSON.parse(storedAuth);
        console.log('Parsed auth:', auth);
        setFactoryAuth(auth);
        
        // 공장 데이터 가져오기 (DB에서)
        let factory;
        try {
          factory = await getFactoryDataFromDB(auth.factoryId);
          console.log('Factory data from DB:', factory);
        } catch (error) {
          console.log('DB 연결 실패, 임시 데이터 사용');
          // 임시 데이터 사용
          factory = {
            id: auth.factoryId,
            name: `봉제공장${auth.factoryId}`,
            region: "서울",
            contact: "02-1234-5678",
            minOrder: 100,
            description: "임시 공장 데이터입니다.",
            items: ["티셔츠", "셔츠", "바지"],
            processes: ["봉제", "나염"],
            kakaoUrl: "https://open.kakao.com/o/temp"
          };
        }
        
        if (factory) {
          // 실제 공장명 결정 (DB company_name 우선, 로그인 시 저장된 공장명, name, 실제 공장명 매핑 순)
          const actualFactoryName = factory.company_name || auth.factoryName || factory.name || getRealFactoryName(auth.factoryId);
          
          setFactoryData(factory);
          setOriginalData(factory);
          setFormData({
            ...factory,
            name: actualFactoryName,
            admin_district: factory.admin_district || "",
            phone_number: factory.phone_number || "",
            business_type: factory.business_type || "",
            factory_type: factory.factory_type || "",
            moq: factory.moq || 0,
            monthly_capacity: factory.monthly_capacity || 0,
            top_items_upper: factory.top_items_upper || "",
            top_items_lower: factory.top_items_lower || "",
            top_items_outer: factory.top_items_outer || "",
            top_items_dress_skirt: factory.top_items_dress_skirt || "",
            top_items_bag: factory.top_items_bag || "",
            top_items_fashion_accessory: factory.top_items_fashion_accessory || "",
            top_items_underwear: factory.top_items_underwear || "",
            top_items_sports_leisure: factory.top_items_sports_leisure || "",
            top_items_pet: factory.top_items_pet || "",
            sewing_machines: factory.sewing_machines || "",
            pattern_machines: factory.pattern_machines || "",
            special_machines: factory.special_machines || "",
            main_fabrics: factory.main_fabrics || "",
            processes: factory.processes || "",
            delivery: factory.delivery || "",
            distribution: factory.distribution || "",
            intro: factory.intro || "",
            description: factory.description || "",
            kakaoUrl: factory.kakaoUrl || ""
          });
        } else {
          setError('공장 데이터를 찾을 수 없습니다.');
        }
        
        // 의뢰내역 가져오기 (DB에서)
        try {
          const requests = await getMatchRequestsByFactoryId(auth.factoryId);
          setMatchRequests(requests);
        } catch (error) {
          console.error('의뢰내역 조회 중 오류:', error);
          setMatchRequests([]);
        }
        
        // 공장 이미지 가져오기
        try {
          const images = await getFactoryImages(auth.factoryId);
          setFactoryImages(images);
        } catch (error) {
          console.error('공장 이미지 조회 중 오류:', error);
          setFactoryImages([]);
        }
        
      } catch (error) {
        console.error('페이지 초기화 중 오류:', error);
        setError('페이지 로딩 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePage();
  }, [router]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/sign-in')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  // 인증 정보나 공장 데이터가 없을 때
  if (!factoryAuth || !factoryData) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">로그인 후 이용 가능합니다.</p>
        <div className="text-sm text-gray-500 mb-4">
          <p>Debug Info:</p>
          <p>factoryAuth: {factoryAuth ? '있음' : '없음'}</p>
          <p>factoryData: {factoryData ? '있음' : '없음'}</p>
        </div>
        <button 
          onClick={() => router.push('/sign-in')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    if (!factoryAuth) return;
    
    try {
      // company_name 필드에 공장명 저장
      const updateData = {
        ...formData,
        company_name: formData.name // 공장명을 company_name 필드에 저장
      };
      
      // DB에 업데이트
      const updatedData = await updateFactoryData(factoryAuth.factoryId, updateData);
      
      if (updatedData) {
        setOriginalData(updatedData);
        setFactoryData(updatedData);
        alert("변경사항이 저장되었습니다.");
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("공장 정보 업데이트 중 오류가 발생했습니다:", error);
      alert("공장 정보 업데이트에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('factoryAuth');
    localStorage.removeItem('userType');
    // 메인페이지로 리다이렉트
    window.location.href = '/';
  };

  // 이미지 업로드 함수
  const handleImageUpload = async (file: File) => {
    if (!factoryAuth) return;
    
    setIsUploading(true);
    try {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      
      const imageUrl = await uploadFactoryImage(file, factoryAuth.factoryId);
      
      if (imageUrl) {
        const updatedImages = [...factoryImages, imageUrl];
        const result = await updateFactoryImages(factoryAuth.factoryId, updatedImages);
        
        if (result) {
          setFactoryImages(updatedImages);
          alert("이미지가 업로드되었습니다.");
        } else {
          alert("이미지 업로드 중 오류가 발생했습니다.");
        }
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // 파일 입력 초기화
    event.target.value = '';
  };

  // 이미지 삭제 함수
  const handleRemoveImage = async (index: number) => {
    if (!factoryAuth) return;
    
    try {
      const imageUrl = factoryImages[index];
      const updatedImages = factoryImages.filter((_, i) => i !== index);
      
      // DB에서 이미지 배열 업데이트
      const result = await updateFactoryImages(factoryAuth.factoryId, updatedImages);
      
      if (result) {
        // Storage에서 이미지 파일 삭제
        await deleteFactoryImage(imageUrl);
        setFactoryImages(updatedImages);
        alert("이미지가 삭제되었습니다.");
      } else {
        alert("이미지 삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류:", error);
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  // 이미지 순서 변경 함수 (첫 번째 이미지가 헤더 프로필 이미지로 사용됨)
  const handleMoveImage = async (fromIndex: number, toIndex: number) => {
    if (!factoryAuth) return;
    
    try {
      const updatedImages = [...factoryImages];
      const [movedImage] = updatedImages.splice(fromIndex, 1);
      updatedImages.splice(toIndex, 0, movedImage);
      
      const result = await updateFactoryImages(factoryAuth.factoryId, updatedImages);
      
      if (result) {
        setFactoryImages(updatedImages);
        alert("이미지 순서가 변경되었습니다.");
      } else {
        alert("이미지 순서 변경 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("이미지 순서 변경 중 오류:", error);
      alert("이미지 순서 변경에 실패했습니다.");
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">마이페이지</h1>
      </div>
      <div className="flex flex-row gap-8">
        {/* 왼쪽 사이드바: 메뉴만 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 h-fit">
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
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </aside>
        {/* 오른쪽 메인 컨텐츠 */}
        <section className="flex-1 bg-white rounded-xl p-8">
          {selectedMenu === "프로필" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">프로필</h2>
              
              {/* 기본 정보 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">기본 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공장명</label>
                  <input
                    type="text"
                    value={formData.name || factoryData?.company_name || ""}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="공장명을 입력해주세요"
                  />
                </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">행정동</label>
                    <input
                      type="text"
                      value={formData.admin_district || ""}
                      onChange={(e) => setFormData({...formData, admin_district: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input
                      type="text"
                      value={formData.contact || ""}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                    <input
                      type="text"
                      value={formData.phone_number || ""}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 이미지 관리 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">이미지 관리</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <label className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <div className="flex items-center justify-center gap-2">
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>업로드 중...</span>
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>이미지 파일 선택</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>• 첫 번째 이미지가 헤더의 프로필 이미지로 사용됩니다.</p>
                    <p>• 이미지 파일은 5MB 이하여야 합니다.</p>
                    <p>• JPG, PNG, GIF 형식을 지원합니다.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {factoryImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={image}
                            alt={`공장 이미지 ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              프로필
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                          >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 flex gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => handleMoveImage(index, index - 1)}
                              className="flex-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              ↑
                            </button>
                          )}
                          {index < factoryImages.length - 1 && (
                            <button
                              onClick={() => handleMoveImage(index, index + 1)}
                              className="flex-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {factoryImages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>등록된 이미지가 없습니다.</p>
                      <p className="text-sm">이미지 파일을 선택하여 업로드해주세요.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 사업 정보 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">사업 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사업 유형</label>
                    <input
                      type="text"
                      value={formData.business_type || ""}
                      onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공장 유형</label>
                    <input
                      type="text"
                      value={formData.factory_type || ""}
                      onChange={(e) => setFormData({...formData, factory_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최소 주문량 (MOQ)</label>
                    <input
                      type="number"
                      value={formData.moq || ""}
                      onChange={(e) => setFormData({...formData, moq: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">월 생산 능력</label>
                    <input
                      type="number"
                      value={formData.monthly_capacity || ""}
                      onChange={(e) => setFormData({...formData, monthly_capacity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 제작 품목 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">제작 품목</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상의 (상단)</label>
                    <input
                      type="text"
                      value={formData.top_items_upper || ""}
                      onChange={(e) => setFormData({...formData, top_items_upper: e.target.value})}
                      placeholder="티셔츠, 셔츠, 블라우스"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">하의 (하단)</label>
                    <input
                      type="text"
                      value={formData.top_items_lower || ""}
                      onChange={(e) => setFormData({...formData, top_items_lower: e.target.value})}
                      placeholder="바지, 스커트, 반바지"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">아우터</label>
                    <input
                      type="text"
                      value={formData.top_items_outer || ""}
                      onChange={(e) => setFormData({...formData, top_items_outer: e.target.value})}
                      placeholder="자켓, 코트, 점퍼"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">원피스/드레스</label>
                    <input
                      type="text"
                      value={formData.top_items_dress_skirt || ""}
                      onChange={(e) => setFormData({...formData, top_items_dress_skirt: e.target.value})}
                      placeholder="원피스, 드레스, 스커트"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가방</label>
                    <input
                      type="text"
                      value={formData.top_items_bag || ""}
                      onChange={(e) => setFormData({...formData, top_items_bag: e.target.value})}
                      placeholder="백팩, 토트백, 클러치"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">패션 액세서리</label>
                    <input
                      type="text"
                      value={formData.top_items_fashion_accessory || ""}
                      onChange={(e) => setFormData({...formData, top_items_fashion_accessory: e.target.value})}
                      placeholder="모자, 스카프, 벨트"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">속옷</label>
                    <input
                      type="text"
                      value={formData.top_items_underwear || ""}
                      onChange={(e) => setFormData({...formData, top_items_underwear: e.target.value})}
                      placeholder="속옷, 언더웨어"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">스포츠/레저</label>
                    <input
                      type="text"
                      value={formData.top_items_sports_leisure || ""}
                      onChange={(e) => setFormData({...formData, top_items_sports_leisure: e.target.value})}
                      placeholder="스포츠웨어, 레저웨어"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">펫 의류</label>
                    <input
                      type="text"
                      value={formData.top_items_pet || ""}
                      onChange={(e) => setFormData({...formData, top_items_pet: e.target.value})}
                      placeholder="펫 의류, 반려동물 의류"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 설비 정보 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">설비 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">봉제 기계</label>
                    <input
                      type="text"
                      value={formData.sewing_machines || ""}
                      onChange={(e) => setFormData({...formData, sewing_machines: e.target.value})}
                      placeholder="오버록, 로크, 버튼홀"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">패턴 기계</label>
                    <input
                      type="text"
                      value={formData.pattern_machines || ""}
                      onChange={(e) => setFormData({...formData, pattern_machines: e.target.value})}
                      placeholder="패턴 제작 기계"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">특수 기계</label>
                    <input
                      type="text"
                      value={formData.special_machines || ""}
                      onChange={(e) => setFormData({...formData, special_machines: e.target.value})}
                      placeholder="특수 가공 기계"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">주요 원단</label>
                    <input
                      type="text"
                      value={formData.main_fabrics || ""}
                      onChange={(e) => setFormData({...formData, main_fabrics: e.target.value})}
                      placeholder="면, 폴리에스터, 니트"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 공정 정보 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">공정 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가능한 공정</label>
                    <input
                      type="text"
                      value={formData.processes || ""}
                      onChange={(e) => setFormData({...formData, processes: e.target.value})}
                      placeholder="봉제, 나염, 자수, QC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배송 서비스</label>
                    <input
                      type="text"
                      value={formData.delivery || ""}
                      onChange={(e) => setFormData({...formData, delivery: e.target.value})}
                      placeholder="택배, 직접 배송"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">유통</label>
                    <input
                      type="text"
                      value={formData.distribution || ""}
                      onChange={(e) => setFormData({...formData, distribution: e.target.value})}
                      placeholder="온라인, 오프라인"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 소개 및 설명 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">소개 및 설명</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공장 소개</label>
                    <textarea
                      value={formData.intro || ""}
                      onChange={(e) => setFormData({...formData, intro: e.target.value})}
                      rows={4}
                      placeholder="공장에 대한 상세한 소개를 작성해주세요."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공장 설명</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      placeholder="공장의 특징과 장점을 설명해주세요."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 연락처 정보 섹션 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">연락처 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카카오톡 URL</label>
                    <input
                      type="url"
                      value={formData.kakaoUrl || ""}
                      onChange={(e) => setFormData({...formData, kakaoUrl: e.target.value})}
                      placeholder="https://open.kakao.com/o/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 버튼들 */}
              <div className="flex justify-end">
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
                카카오톡 연동 예정입니다.
              </div>
            </div>
          )}

          {selectedMenu === "의뢰내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">의뢰내역</h2>
              {matchRequests.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg mb-2">의뢰내역이 없습니다</div>
                  <div className="text-gray-500 text-sm">새로운 의뢰가 들어오면 여기에 표시됩니다</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.userName}</h3>
                          <p className="text-sm text-gray-600">{request.userEmail}</p>
                          <p className="text-sm text-gray-600">{request.contact}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-300' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                            'bg-blue-100 text-blue-700 border-blue-300'
                          }`}>
                            {request.status === 'pending' ? '대기중' :
                             request.status === 'accepted' ? '수락됨' :
                             request.status === 'rejected' ? '거절됨' :
                             '완료됨'}
                          </span>
                          <span className="text-sm text-gray-500">{request.requestDate}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">브랜드명</p>
                          <p className="text-sm text-gray-600">
                            {request.additional_info ? 
                              (() => {
                                try {
                                  const additionalInfo = JSON.parse(request.additional_info);
                                  return additionalInfo.brandName || '미입력';
                                } catch {
                                  return '미입력';
                                }
                              })() : '미입력'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">선택 서비스</p>
                          <p className="text-sm text-gray-600">
                            {request.additional_info ? 
                              (() => {
                                try {
                                  const additionalInfo = JSON.parse(request.additional_info);
                                  const serviceMap = {
                                    'standard': 'Standard (봉제공정)',
                                    'deluxe': 'Deluxe (패턴/샘플 + 공장)',
                                    'premium': 'Premium (올인원)'
                                  };
                                  return serviceMap[additionalInfo.selectedService as keyof typeof serviceMap] || '미선택';
                                } catch {
                                  return '미선택';
                                }
                              })() : '미선택'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">의뢰 내용</p>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>
                      
                      {request.additional_info && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">상세 정보</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            {(() => {
                              try {
                                const additionalInfo = JSON.parse(request.additional_info);
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div><span className="font-medium">샘플:</span> {additionalInfo.sample || '미보유'}</div>
                                    <div><span className="font-medium">패턴:</span> {additionalInfo.pattern || '미보유'}</div>
                                    <div><span className="font-medium">QC:</span> {additionalInfo.qc || '미희망'}</div>
                                    <div><span className="font-medium">시아게:</span> {additionalInfo.finishing || '미희망'}</div>
                                    <div><span className="font-medium">포장:</span> {additionalInfo.packaging || '미희망'}</div>
                                    {additionalInfo.links && additionalInfo.links.length > 0 && (
                                      <div className="md:col-span-2">
                                        <span className="font-medium">참고 링크:</span> {additionalInfo.links.join(', ')}
                                      </div>
                                    )}
                                    {additionalInfo.files && additionalInfo.files.length > 0 && (
                                      <div className="md:col-span-2">
                                        <span className="font-medium">첨부 파일:</span> {additionalInfo.files.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch {
                                return <p>상세 정보를 불러올 수 없습니다.</p>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => router.push(`/factory-my-page/requests/${request.id}`)}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                          상세보기
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={async () => {
                                const success = await updateMatchRequestStatus(request.id, 'accepted');
                                if (success) {
                                  // 의뢰내역 다시 로드
                                  const updatedRequests = await getMatchRequestsByFactoryId(factoryAuth.factoryId);
                                  setMatchRequests(updatedRequests);
                                  alert('의뢰를 수락했습니다.');
                                } else {
                                  alert('수락 처리 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors border border-green-300"
                            >
                              수락
                            </button>
                            <button 
                              onClick={async () => {
                                const success = await updateMatchRequestStatus(request.id, 'rejected');
                                if (success) {
                                  // 의뢰내역 다시 로드
                                  const updatedRequests = await getMatchRequestsByFactoryId(factoryAuth.factoryId);
                                  setMatchRequests(updatedRequests);
                                  alert('의뢰를 거절했습니다.');
                                } else {
                                  alert('거절 처리 중 오류가 발생했습니다.');
                                }
                              }}
                              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors border border-red-300"
                            >
                              거절
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 