"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

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
        <form action="/api/admin/logout" method="post">
          <button 
            className="w-full py-2 px-3 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm" 
            type="submit"
          >
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
