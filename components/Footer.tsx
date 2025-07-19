"use client";

import React from "react";

// Footer 컴포넌트: 사이트 하단에 고정적으로 표시되는 정보 영역입니다.
// - md 미만에서는 햄버거 버튼이 나타나고, 클릭 시 전체 메뉴와 로그인/회원가입 버튼이 드롭다운으로 노출됩니다.
// - md 이상에서는 기존 nav 메뉴가 그대로 노출됩니다.
// - 스타일은 Tailwind CSS를 사용합니다.

const Footer = () => {
  // 메뉴 항목(왼쪽/오른쪽 메뉴)
  const leftMenu = [
    { href: "/factories", label: "봉제공장 찾기" },
    { href: "/matching", label: "AI 매칭" },
    { href: "/notices", label: "공지사항" },
  ];
  const rightMenu = [
    { href: "#", label: "고객센터" },
    { href: "#", label: "제휴문의" },
    { href: "#", label: "이용약관" },
    { href: "#", label: "개인정보처리방침" },
  ];

  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-200 py-12 px-6 mt-16">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-4 px-10">
        {/* nav: md 이상에서만 flex, md 미만에서는 hidden */}
        <nav className="hidden md:flex w-full justify-between items-center mb-4 text-sm text-gray-700">
          {/* 왼쪽 메뉴 그룹 */}
          <div className="flex gap-8">
            {leftMenu.map((item) => (
              <a key={item.label} href={item.href} className="hover:underline">{item.label}</a>
            ))}
          </div>
          {/* 오른쪽 메뉴 그룹 */}
          <div className="flex gap-8">
            {rightMenu.map((item) => (
              <a key={item.label} href={item.href} className="hover:underline">{item.label}</a>
            ))}
          </div>
        </nav>
        {/* 협회 정보 */}
        <div className="text-xs text-gray-500 mb-1 text-center">
          (사)DDM패션봉제산업연합회  |  (사)동대문패션봉제발전산업협의회  |  (사)동대문구의류봉제산업연합회
        </div>
        {/* 저작권 문구 */}
        <div className="text-xs text-gray-400 text-center">
          ©2025 donggori. All rights reserved.
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