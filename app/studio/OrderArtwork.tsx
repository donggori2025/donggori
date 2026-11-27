import { asset, sheets } from "./case";
import { parkaOrder } from "@/lib/presentationDemo";

// The reference sheet is a bitmap. Replace its allocation table in every rendition.
export function SpecArtwork({ request }: { request: string }) {
  const order = parkaOrder(request);
  return <g>
    <image href={asset(sheets[0].file)} width="1279" height="924" />
    {!order.sample && <g>
      <rect x="776" y="486" width="474" height="239" fill="white" stroke="#cdd5df" />
      <text x="800" y="539" fontSize="25" fill="#304960">요청 생산 수량</text>
      <text x="800" y="612" fontSize="47" fontWeight="700" fill="#173c72">{order.quantity ? order.quantity.toLocaleString("ko-KR") + "장" : "상세 조건 참조"}</text>
      <text x="800" y="677" fontSize="21" fill="#304960">{order.text.length > 19 ? order.text.slice(0, 18) + "…" : order.text}</text>
    </g>}
  </g>;
}

export default function OrderArtwork({ request, page, className }: { request: string; page: number; className?: string }) {
  if (page || parkaOrder(request).sample) return <img className={className} src={asset(sheets[page].file)} alt={sheets[page].title} />;
  return <svg className={className} width="1279" height="924" viewBox="0 0 1279 924" role="img" aria-label="요청 수량이 반영된 파카 스펙 보드"><SpecArtwork request={request} /></svg>;
}
