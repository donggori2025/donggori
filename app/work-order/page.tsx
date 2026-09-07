import React from 'react';
import type { Metadata } from 'next';
import { PageHeader, PageShell } from '@/components/ui/app-ui';

export const metadata: Metadata = {
  title: '동고리 작업지시서 - 의류 생산을 효율적으로 관리하는 방법',
  description:
    '동고리 작업지시서는 의류 생산에 필요한 모든 정보를 디지털로 관리할 수 있게 합니다. 봉제공장과 실시간으로 소통하며 오류를 줄이고 품질을 높입니다.',
};

export default function WorkOrderPage() {
  return (
    <PageShell readable>
      <PageHeader
        title="디지털 작업지시서로 효율적인 생산 관리"
        description="생산 현장에 필요한 정보와 자료를 한곳에 모아 의류 제작과 품질 관리를 더 명확하게 만듭니다."
      />
    </PageShell>
  );
}


