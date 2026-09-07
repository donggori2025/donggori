import Image from "next/image";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { ArrowRight } from "lucide-react";

const RecommendSection = () => {
  return (
    <section className="w-full bg-white">
      <div className="relative isolate min-h-[460px] w-full overflow-hidden sm:min-h-[520px] lg:min-h-[580px]">
        <Image
          src="/images/design-request-hero.jpg"
          alt="도식화와 작업지시 자료"
          fill
          sizes="100vw"
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50" />

        <div
          className={`${PAGE_CONTAINER_CLASS} relative z-10 flex min-h-[460px] items-center justify-center py-14 text-center sm:min-h-[520px] lg:min-h-[580px]`}
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              디자인 의뢰하기
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              상품 정보와 레퍼런스를 남겨주시면 디자인 방향과 제작 흐름을 함께 정리해드립니다.
            </p>
            <Link
              href="/design-request"
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              디자인 의뢰하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendSection;
