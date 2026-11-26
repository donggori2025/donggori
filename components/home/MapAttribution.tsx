import { Info } from "lucide-react";

export function MapAttribution() {
  return (
    <details className="pg-map-info">
      <summary aria-label="지도 정보와 출처">
        <Info />
      </summary>
      <p>
        핀은 업체가 공개한 대략적인 위치를 나타냅니다. 숫자는 해당 위치의 업체 수입니다.
        <br />
        통계청{" "}
        <a href="https://sgis.kostat.go.kr" target="_blank" rel="noreferrer">
          SGIS
        </a>{" "}
        행정동 경계(공공누리 제1유형).{" "}
        <a
          href="https://github.com/vuski/admdongkor/tree/master/ver20261001"
          target="_blank"
          rel="noreferrer"
        >
          vuski/admdongkor
        </a>{" "}
        2026.10.01 자료를 단순화·투영했습니다.{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
      </p>
    </details>
  );
}
