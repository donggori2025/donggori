"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // 로그아웃 성공 시 메인페이지로 리다이렉트
        window.location.href = "/";
      } else {
        console.error("로그아웃 실패");
        alert("로그아웃에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 fixed top-[72px] h-[calc(100vh-72px)] overflow-y-auto z-0" style={{ left: 'max(0px, calc(50% - 700px))' }}>
      <div className="font-bold text-xl mb-8">관리자 대시보드</div>
      <nav className="flex flex-col gap-2">
        <Link 
          href="/admin/factories" 
          className={`px-3 py-2 rounded text-base font-medium transition-colors ${
            pathname === "/admin/factories" ? "bg-toss-blue text-black font-bold" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          업장 관리
        </Link>
        <Link 
          href="/admin/popups" 
          className={`px-3 py-2 rounded text-base font-medium transition-colors ${
            pathname === "/admin/popups" ? "bg-toss-blue text-black font-bold" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          팝업 관리
        </Link>
        <Link 
          href="/admin/notices" 
          className={`px-3 py-2 rounded text-base font-medium transition-colors ${
            pathname === "/admin/notices" ? "bg-toss-blue text-black font-bold" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          공지 관리
        </Link>
      </nav>
      
      {/* 로그아웃 버튼 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-2 px-3 rounded bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors text-sm" 
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </aside>
  );
}
