import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '동고리 고객센터 - 자주 묻는 질문',
  description:
    '동고리 이용과 관련해 자주 묻는 질문과 답변을 확인하세요. 서비스 이용, 작업지시서 작성, 봉제공장 매칭 등 모든 궁금증을 해결해 드립니다.',
};

export default function FAQPage() {
  return (
    <main className="px-2 sm:px-4 md:px-6">
      <section className="max-w-[1200px] mx-auto py-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">자주 묻는 질문(FAQ)</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          동고리 서비스 이용 중 궁금하신 점을 빠르게 해결할 수 있도록 자주 묻는 질문과 답변을 정리했습니다.
        </p>
      </section>
    </main>
  );
}


