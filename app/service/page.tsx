import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '동고리 서비스 소개 - 작업지시서 디지털화 & 생산 파트너 매칭',
  description:
    '동고리는 작업지시서를 디지털화해 봉제공장과 원활히 협업할 수 있도록 돕는 의류 제작 플랫폼입니다. 생산 효율을 높이고 품질을 보장합니다.',
};

export default function ServiceIntroPage() {
  return (
    <main className="px-2 sm:px-4 md:px-6">
      <section className="max-w-[1200px] mx-auto py-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">동고리 서비스의 핵심 기능</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          동고리는 봉제공장과 디자이너를 연결하는 의류 제작 플랫폼으로, 프로젝트 매칭과 작업지시서 디지털화를 통해 생산 효율성을 극대화합니다.
        </p>
      </section>
    </main>
  );
}


