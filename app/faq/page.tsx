import React from 'react';
import type { Metadata } from 'next';
import { PageHeader, PageShell } from '@/components/ui/app-ui';

export const metadata: Metadata = {
  title: '동고리 고객센터 - 자주 묻는 질문',
  description:
    '동고리 이용과 관련해 자주 묻는 질문과 답변을 확인하세요. 서비스 이용, 작업지시서 작성, 봉제공장 매칭 등 모든 궁금증을 해결해 드립니다.',
};

export default function FAQPage() {
  return (
    <PageShell readable>
      <PageHeader
        title="자주 묻는 질문"
        description="동고리 서비스 이용 중 궁금하신 점을 빠르게 해결할 수 있도록 자주 묻는 질문과 답변을 정리했습니다."
      />
    </PageShell>
  );
}

