'use client';
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 마이페이지 메뉴 항목 배열(경로 명확화)
const menu = [
  { label: "문의 내역", href: "/my-page/inquiries" },
  { label: "프로필 수정", href: "/my-page/profile" },
];

export function AccountShell({
  children,
  title = "마이페이지",
  items = menu,
}: {
  children: React.ReactNode;
  title?: string;
  items?: { label: string; href: string }[];
}) {
  const pathname = usePathname();
  return (
    <section className="min-h-[80vh] bg-[#f5f5f3] py-10 sm:py-16">
      <div className={`${PAGE_CONTAINER_CLASS} grid gap-8 md:grid-cols-[220px_1fr] lg:gap-12`}>
      <aside>
        <div className="mb-6 text-xl font-bold">{title}</div>
        <nav className="flex gap-2 overflow-x-auto border-b border-gray-300 pb-4 md:flex-col md:border-b-0 md:border-r md:pb-0 md:pr-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-dg-ink text-white"
                  : "text-gray-600 hover:bg-white hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}