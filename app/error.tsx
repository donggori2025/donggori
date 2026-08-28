"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">일시적인 문제가 발생했습니다.</h1>
      <p className="mt-3 text-gray-600">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="mt-7 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white">다시 시도</button>
    </section>
  );
}
