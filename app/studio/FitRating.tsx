import { Star } from "lucide-react";

export default function FitRating({ stars }: { stars: number }) {
  const grade = ["", "요청 키워드 연관", "유사 품목", "품목 일치"][stars];
  return <span className="fit-rating" aria-label={`이번 의뢰 추천도 ${stars}단계 · ${grade}`}>
    <span aria-hidden="true">{Array.from({ length: stars }, (_, i) =>
      <Star key={i} size={14} fill="currentColor" />)}</span>
    {grade}
  </span>;
}
