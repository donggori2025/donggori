import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '동고리 작업지시서 - 의류 생산을 효율적으로 관리하는 방법',
  description:
    '동고리 작업지시서는 의류 생산에 필요한 모든 정보를 디지털로 관리할 수 있게 합니다. 봉제공장과 실시간으로 소통하며 오류를 줄이고 품질을 높입니다.',
};

export default function WorkOrderPage() {
  return (
    <main className="px-2 sm:px-4 md:px-6">
      <section className="max-w-[1200px] mx-auto py-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">디지털 작업지시서로 효율적인 생산 관리</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          동고리의 디지털 작업지시서는 생산 현장에서 필요한 정보와 자료를 한 곳에 모아, 효율적인 의류 제작과 품질 관리를 가능하게 합니다.
        </p>
      </section>
    </main>
  );
}


