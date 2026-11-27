import { Eye, Handshake, PencilRuler, UsersRound } from "lucide-react";
import { useCountTransition } from "./useCountTransition";

// 조회수·방문자는 운영성과보고서(2026-11-23) 2쪽의 반올림 수치, 디자이너 가입수는 별도 제공 수치.
const usageMetrics = [
  { label: "전체 페이지 조회수", unit: "회", figure: 35000, Icon: Eye },
  { label: "홈페이지 방문자", unit: "명", figure: 6700, Icon: UsersRound },
  { label: "매칭 페이지 방문자", unit: "명", figure: 1700, Icon: Handshake },
  { label: "디자이너 가입수", unit: "명", figure: 500, Icon: PencilRuler },
] as const;
const countFormat = new Intl.NumberFormat("ko-KR");

const usageTotals = usageMetrics.map(({ figure }) => figure);
export default function UsageStats() {
  const { ref, values } = useCountTransition<HTMLElement>(usageTotals);

  return (
    <section ref={ref} className="pg-usage-section" aria-label="동고리 이용 통계">
      <dl className="site-wide pg-usage">
        {usageMetrics.map(({ label, unit, figure, Icon }, i) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <Icon aria-hidden="true" />
              <span className="sr-only">약 {countFormat.format(figure)}{unit}</span>
              <span className="pg-usage-value" aria-hidden="true">
                <span className="pg-usage-digits" data-final={countFormat.format(figure)}>
                  <span>{countFormat.format(values[i])}</span>
                </span><span className="pg-usage-unit">{unit}</span><small>++</small>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
