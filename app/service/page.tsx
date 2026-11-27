import Link from 'next/link';
import { SERVICE_LINKS } from '@/lib/navigation';
import type { Metadata } from 'next';
import { PageHeader, PageShell } from '@/components/ui/app-ui';

export const metadata: Metadata = {
  title: '동고리 서비스 소개 - 작업지시서 디지털화 & 생산 파트너 매칭',
  description:
    '동고리는 작업지시서를 디지털화해 봉제공장과 원활히 협업할 수 있도록 돕는 의류 제작 플랫폼입니다. 생산 효율을 높이고 품질을 보장합니다.',
};

export default function ServiceIntroPage() {
  return (
    <PageShell readable>
      <PageHeader
        title="서비스 이용안내"
        description="동고리는 봉제공장과 디자이너를 연결하는 의류 제작 플랫폼으로, 프로젝트 매칭과 작업지시서 디지털화를 통해 생산 효율성을 높입니다."
      />
      {SERVICE_LINKS.map((item) => <Link className="civic-row" key={item.href} href={item.href}><strong>{item.label}</strong><span aria-hidden>→</span></Link>)}
    </PageShell>
  );
}
