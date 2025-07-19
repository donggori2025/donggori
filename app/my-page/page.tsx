"use client";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";

// 샘플 문의내역 데이터
const sampleInquiries = [
  {
    id: 1,
    factoryName: "재민상사",
    date: "25.05.06",
    image: "/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg",
    tags: ["패턴", "샘플", "봉제"],
    details: {
      mainItems: "브랜드 남방, 원피스, 자켓, 코트",
      mainFabric: "다이마루",
      moq: "100",
      sampleFee: "100,000원",
      unitPrice: "16,800원(10%)"
    }
  },
  {
    id: 2,
    factoryName: "태산상사",
    date: "25.05.10",
    image: "/logo_donggori.png",
    tags: ["봉제"],
    details: {
      mainItems: "브랜드 남방, 원피스, 자켓, 코트",
      mainFabric: "다이마루",
      moq: "100",
      sampleFee: "100,000원",
      unitPrice: "16,800원(10%)"
    }
  },
  {
    id: 3,
    factoryName: "회기상사",
    date: "25.05.16",
    image: "/logo_donggori.svg",
    tags: ["패턴", "샘플"],
    details: {
      mainItems: "브랜드 남방, 원피스, 자켓, 코트",
      mainFabric: "다이마루",
      moq: "100",
      sampleFee: "100,000원",
      unitPrice: "16,800원(10%)"
    }
  }
];

const SIDEBAR_MENUS = ["프로필", "문의내역", "의뢰내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

export default function MyPage() {
  const { user } = useUser();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
  const [name, setName] = useState(user?.firstName || "김한재");
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "hanjaekim99@gmail.com");

  if (!user) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }



  const handleSaveChanges = () => {
    // 실제로는 API 호출로 데이터 저장
    alert("변경사항이 저장되었습니다.");
  };

  const handleWithdraw = () => {
    if (confirm("정말 탈퇴하시겠습니까?")) {
      // 실제로는 탈퇴 처리
      alert("탈퇴 처리가 완료되었습니다.");
    }
  };

  console.log("Clerk user 객체:", user);

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">마이페이지</h1>
      <p className="text-lg text-gray-500 mb-8">내 정보와 문의내역을 확인할 수 있습니다.</p>
      <div className="flex flex-row gap-8 min-h-[500px]">
        {/* 왼쪽 사이드바: 메뉴만 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 flex flex-col items-center">
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
        </aside>
        {/* 오른쪽 메인 컨텐츠 */}
        <section className="flex-1 bg-white rounded-xl shadow p-8">
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
                  <div className="text-xl font-semibold mb-2">{name}</div>
                  <div className="flex gap-4 text-sm">
                    <button className="text-blue-600 hover:underline">사진 삭제</button>
                    <button className="text-blue-600 hover:underline">사진 업로드</button>
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
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  탈퇴하기
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                >
                  변경사항 저장
                </button>
              </div>
            </div>
          )}

          {selectedMenu === "문의내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">문의내역</h2>
              <div className="space-y-6">
                {sampleInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    {/* 이미지 */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <Image
                        src={inquiry.image}
                        alt={inquiry.factoryName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* 내용 */}
                    <div className="flex-1">
                      {/* 태그들 */}
                      <div className="flex gap-2 mb-2">
                        {inquiry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              tag === "패턴" ? "bg-purple-200 text-purple-800" :
                              tag === "샘플" ? "bg-green-200 text-green-800" :
                              "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* 회사명 */}
                      <h3 className="font-bold text-lg mb-2">{inquiry.factoryName}</h3>
                      
                      {/* 상세 정보 */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>주요품목 {inquiry.details.mainItems}</p>
                        <p>주요원단 {inquiry.details.mainFabric}</p>
                        <p>MOQ(최소 주문 수량) {inquiry.details.moq}</p>
                        <p>샘플비 {inquiry.details.sampleFee}</p>
                        <p>장단 단가 {inquiry.details.unitPrice}</p>
                      </div>
                    </div>
                    
                    {/* 오른쪽 액션 영역 */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">문의일 {inquiry.date}</div>
                      <div className="flex flex-col gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          문의하기
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded text-sm">
                          <span className="text-white">📁</span>
                          의뢰하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMenu === "의뢰내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-8">의뢰내역</h2>
              <div className="space-y-6">
                {sampleInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    {/* 이미지 */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <Image
                        src={inquiry.image}
                        alt={inquiry.factoryName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* 내용 */}
                    <div className="flex-1">
                      {/* 태그들 */}
                      <div className="flex gap-2 mb-2">
                        {inquiry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              tag === "패턴" ? "bg-purple-200 text-purple-800" :
                              tag === "샘플" ? "bg-green-200 text-green-800" :
                              "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* 회사명 */}
                      <h3 className="font-bold text-lg mb-2">{inquiry.factoryName}</h3>
                      
                      {/* 상세 정보 */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>주요품목 {inquiry.details.mainItems}</p>
                        <p>주요원단 {inquiry.details.mainFabric}</p>
                        <p>MOQ(최소 주문 수량) {inquiry.details.moq}</p>
                        <p>샘플비 {inquiry.details.sampleFee}</p>
                        <p>장단 단가 {inquiry.details.unitPrice}</p>
                      </div>
                    </div>
                    
                    {/* 오른쪽 액션 영역 */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">문의일 {inquiry.date}</div>
                      <div className="flex flex-col gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          문의하기
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded text-sm">
                          <span className="text-white">📁</span>
                          의뢰하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 