import React from "react";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

// Footer 컴포넌트: 사이트 하단에 고정적으로 표시되는 정보 영역입니다.
// - md 미만에서는 햄버거 버튼이 나타나고, 클릭 시 전체 메뉴와 로그인/회원가입 버튼이 드롭다운으로 노출됩니다.
// - md 이상에서는 기존 nav 메뉴가 그대로 노출됩니다.
// - 스타일은 Tailwind CSS를 사용합니다.

const Footer = () => {
  // 메뉴 항목(왼쪽/오른쪽 메뉴)
  const leftMenu = [
    { href: "/factories", label: "봉제공장 찾기" },
    { href: "/design-request", label: "디자인 의뢰하기" },
    { href: "/matching", label: "맞춤 추천" },
    { href: "/notices", label: "공지사항" },
  ];
  const rightMenu = [
    { href: "mailto:donggori2020@gmail.com?subject=동고리 고객센터 문의", label: "고객센터" },
    { href: "mailto:donggori2020@gmail.com?subject=동고리 제휴 문의", label: "제휴문의" },
    { href: "/terms/service", label: "이용약관" },
    { href: "/terms/privacy", label: "개인정보처리방침" },
  ];

  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-200 py-8 sm:py-12 mt-8 sm:mt-16 relative z-50">
      <div className={`${PAGE_CONTAINER_CLASS} flex flex-col items-center gap-3 sm:gap-4`}>
        {/* nav: md 이상에서만 flex, md 미만에서는 hidden */}
        <nav className="hidden md:flex w-full justify-between items-center mb-3 sm:mb-4 text-sm text-gray-700">
          {/* 왼쪽 메뉴 그룹 */}
          <div className="flex gap-8 lg:gap-10">
            {leftMenu.map((item) => (
              <Link key={item.label} href={item.href} className="hover:underline">{item.label}</Link>
            ))}
          </div>
          {/* 오른쪽 메뉴 그룹 */}
          <div className="flex gap-8 lg:gap-10">
            {rightMenu.map((item) => (
              <Link key={item.label} href={item.href} className="hover:underline">{item.label}</Link>
            ))}
          </div>
        </nav>
        {/* 협회 정보 */}
        <div className="text-xs text-gray-500 mb-1 text-center px-4">
          사단법인 동대문구의류봉제산업연합회
        </div>
        {/* 연락처 정보 */}
        <div className="text-xs text-gray-500 text-center px-4 space-y-1">
          <div>주소 : 서울특별시 동대문구 한빛로62, 7층패션봉제복합지원센터 (용두동)</div>
          <div>사업자등록번호 : 511-82-07533</div>
          <div>이메일 : donggori2020@gmail.com</div>
        </div>

      </div>
      {/* 사이드 드로어 애니메이션 (Tailwind에 없으므로 직접 정의 필요) */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
