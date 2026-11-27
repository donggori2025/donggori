"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "linear-gradient(145deg, #e8f3ff, #fff 65%)", color: "#192f50", fontFamily: "Pretendard, system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "auto", minHeight: "100vh", padding: "0 24px", display: "grid", alignContent: "center", justifyItems: "center", textAlign: "center" }}>
          <h1>서비스를 불러오지 못했습니다.</h1>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type="button" style={{ marginTop: 12, border: 0, borderRadius: 24, padding: "12px 24px", background: "#0a5fda", color: "white", font: "inherit", cursor: "pointer" }} onClick={reset}>다시 시도</button>
        </main>
      </body>
    </html>
  );
}
