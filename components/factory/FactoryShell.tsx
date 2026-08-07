"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

export default function FactoryShell() {
  const router = useRouter();
  const [factoryName, setFactoryName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("factoryAuth");
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        setFactoryName(auth.factoryName || "봉제공장");
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "factory_session=; path=/; max-age=0";
    document.cookie = "factory_user=; path=/; max-age=0";
    document.cookie = "userType=; path=/; max-age=0";
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    localStorage.removeItem("factoryAuth");
    localStorage.removeItem("userType");
    router.push("/sign-in");
  };

  return (
    <header className="sticky top-0 z-[9998] border-b border-gray-200 bg-white shadow-sm">
      <div className={`${PAGE_CONTAINER_CLASS} max-w-[1200px] flex items-center justify-between gap-4 py-4 md:py-5`}>
        <div>
          <p className="text-sm font-medium text-emerald-700">봉제공장 사장님</p>
          <h1 className="text-2xl font-bold text-gray-900">의뢰함</h1>
          {factoryName && <p className="mt-0.5 text-lg text-gray-600">{factoryName}</p>}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-xl border-2 border-gray-300 px-5 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
