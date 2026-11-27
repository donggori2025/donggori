import { useState, type CSSProperties } from "react";
import "./product-photo-stack.css";

// The bundled photos are copies of the published gallery for Musinsa product 7487035.
const gallery = [
  ["대표", "goods_img/20261011/7487035/7487035_17948998151205_big.jpg", "product.webp"],
  ["앞면", "prd_img/20261011/7487035/detail_7487035_17948998165793_big.jpg", "parka-front.webp"],
  ["뒷면", "prd_img/20261011/7487035/detail_7487035_17948998167466_big.jpg", "parka-back.webp"],
  ["착용", "prd_img/20261011/7487035/detail_7487035_17948998158927_big.jpg", "parka-worn.webp"],
] as const;
export const photoTotal = gallery.length;

export type PhotoStackProps = {
  requested: number;
  ready: number;
  onReady: (count: number) => void;
};

export default function ProductPhotoStack({ requested, ready, onReady }: PhotoStackProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const [retries, setRetries] = useState<Record<string, number>>({});
  const missing = requested > ready && failed.includes(gallery[ready][1]) && failed.includes(gallery[ready][2]);

  return (
    <div className="parka-stack">
      {gallery.slice(0, requested).map(([label, path, file], i) => (
        <div
          className="parka-print" key={`${file}-${retries[file] ?? 0}`} data-visible={i < ready}
          style={{ "--spread": i - (Math.max(ready, 1) - 1) / 2 } as CSSProperties}
          role="img" aria-label={`상품 ${label} 사진`} aria-hidden={i >= ready}
        >
          <img alt="" src={`/images/demo/${file}`}
            onLoad={() => onReady(i + 1)} onError={() => setFailed(prev => [...prev, file])} />
          <img alt="" referrerPolicy="no-referrer"
            src={`https://image.msscdn.net/thumbnails/images/${path}?w=760`}
            onLoad={() => onReady(i + 1)} onError={event => {
              event.currentTarget.hidden = true;
              setFailed(prev => [...prev, path]);
            }} />
          <span>{label}</span>
        </div>
      ))}
      {missing && <button type="button" className="parka-retry" onClick={() => {
        setFailed([]);
        const file = gallery[ready][2];
        setRetries(prev => ({ ...prev, [file]: (prev[file] ?? 0) + 1 }));
      }}>사진 다시 불러오기</button>}
    </div>
  );
}
