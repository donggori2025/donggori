import Link from 'next/link';
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
        title="작업지시서 이용안내"
        description="공장 상세 화면에서 제작 의뢰를 열고 제품, 원단, 수량, 납기를 입력하세요. Faddit 작업지시서가 있다면 링크를 함께 등록할 수 있습니다."
      />
      <Link href="/factories" className="civic-action">의뢰할 공장 찾기 →</Link>
    </PageShell>
  );
}

