import Image from "next/image";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { SERVICE_LINKS, SUPPORT_LINKS } from "@/lib/navigation";

const Footer = () => {
  return (
    <footer className="relative z-50 w-full border-t border-dg-line bg-[#f5f5f3] py-14 sm:py-20">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="grid gap-12 border-b border-gray-300/70 pb-14 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block select-none" aria-label="동고리 홈">
              <Image
                src="/logo_donggori.svg"
                alt="동고리 로고"
                width={113}
                height={47}
                className="h-auto w-24 sm:w-28"
                style={{ height: "auto" }}
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-dg-muted">
              디자이너와 동대문 봉제공장을 연결하는 의류 생산 플랫폼입니다.
            </p>
          </div>
          <nav aria-label="서비스">
            <div className="flex flex-col items-start gap-3 text-sm">
              {SERVICE_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-700 transition hover:text-black">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          <nav aria-label="정보">
            <div className="flex flex-col items-start gap-3 text-sm">
              {SUPPORT_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-700 transition hover:text-black">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-xs leading-5 text-gray-500 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-semibold text-gray-700">사단법인 동대문구의류봉제산업연합회</p>
            <p className="mt-2">서울특별시 동대문구 한빛로 62, 7층 패션봉제복합지원센터</p>
            <p>사업자등록번호 511-82-07533 · donggori2020@gmail.com</p>
          </div>
          <p>© DONGGORI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
