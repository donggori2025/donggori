import Image from "next/image";
import Link from "next/link";
import { SERVICE_LINKS, SUPPORT_LINKS } from "@/lib/navigation";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-wide">
        <div className="footer-top">
          <div className="footer-links">
            {([["제작 서비스", SERVICE_LINKS], ["이용 안내", SUPPORT_LINKS]] as const).map(([label, links]) => (
              <nav key={label} aria-label={label}>
                {links.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
              </nav>
            ))}
          </div>
          <Link href="/" aria-label="동고리 홈" className="shrink-0">
            <Image src="/logo_donggori_0914_transparent.svg" alt="동고리 로고"
              width={798} height={266} sizes="112px" className="h-auto w-24 sm:w-28" />
          </Link>
        </div>
        <div className="footer-details">
          <div>
            <p className="font-semibold">사단법인 동대문구의류봉제산업연합회</p>
            <p>서울특별시 동대문구 한빛로 62, 7층 패션봉제복합지원센터</p>
            <p>사업자등록번호 511-82-07533 · donggori2020@gmail.com</p>
          </div>
          <p>© DONGGORI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
