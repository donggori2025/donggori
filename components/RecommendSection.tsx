import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RecommendSection() {
  return (
    <section className="design-band site-wide" aria-labelledby="design-request-title">
      <div className="design-image">
        <Image src="/images/design-request-hero.jpg" alt="도식화와 작업지시 자료" fill
          sizes="(max-width: 700px) 95vw, 40vw" className="object-cover" />
      </div>
      <div className="design-copy">
        <h2 id="design-request-title">디자인 의뢰하기</h2>
        <p>상품 정보와 레퍼런스를 남겨주시면<br />디자인 방향과 제작 흐름을 함께 정리해드립니다.</p>
        <Link href="/design-request" className="landing-action">디자인 의뢰하기 <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}
