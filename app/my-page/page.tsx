"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">마이페이지</h1>
      <p className="text-lg text-gray-500 mb-8">내 정보와 문의내역을 확인할 수 있습니다.</p>
      <div className="flex flex-row gap-8 min-h-[500px]">
        {/* 왼쪽 사이드바: 메뉴만 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 flex flex-col">
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
        <section className="flex-1 bg-white rounded-xl p-8">
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
              <div className="text-center py-20 text-gray-400 text-lg">
                의뢰내역이 없습니다.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 