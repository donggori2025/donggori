"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="ko">
      <body>
        <main style={{ maxWidth: 560, margin: "20vh auto", padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>서비스를 불러오지 못했습니다.</h1>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type="button" onClick={reset}>다시 시도</button>
        </main>
      </body>
    </html>
  );
}
