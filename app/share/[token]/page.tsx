"use client";

import { useParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { TechPackPreview } from "@/components/tech-pack";
import { useWorkspace } from "@/lib/store";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { getProductByShareToken } = useWorkspace();
  const product = getProductByShareToken(token);

  const access = product?.anyoneAccess ?? "none";
  const canView = Boolean(product) && access !== "none";

  if (!product || !canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="max-w-md rounded-[28px] border border-mist bg-snow p-8 text-center">
          <BrandLogo />
          <p className="mt-6 text-[16px] font-medium">
            {product ? "이 링크의 공유가 꺼져 있습니다." : "공유된 제품을 찾을 수 없습니다."}
          </p>
          <p className="mt-2 text-[13px] text-stone">브랜드에 새 공유 링크를 요청해 주세요.</p>
        </div>
      </div>
    );
  }

  return <TechPackPreview product={product} variant="share" />;
}
