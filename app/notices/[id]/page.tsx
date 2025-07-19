import { notices } from "@/lib/notices";
import Link from "next/link";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = notices.find(n => n.id === id);
  if (!notice) {
    return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공지입니다.</div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* 상단 섹션 */}
        <div className="mb-12">
          <div className="text-sm text-gray-500 mb-2">업데이트</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {notice.title}
          </h1>
          <div className="text-lg text-gray-600 mb-8">
            {notice.createdAt}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 인사말 */}
          <div className="text-lg text-gray-700">
            안녕하세요, 동고리입니다.
          </div>

          {/* 업데이트 일정 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">■ 업데이트 일정</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-2 text-gray-700">
                <p>• 업데이트 일시: {notice.createdAt} 오전 8시경 (한국 시간 기준)</p>
                <p>• 작업 시작: {notice.createdAt} 오후 8시부터</p>
                <p>• 서비스 이용: 작업 중에도 이용 가능하나 일시적으로 불안정할 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 업데이트 내용 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">■ 업데이트 내용</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {notice.content}
                </div>
                <div className="text-gray-500 text-sm">
                  ... 계속 읽기
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <Link 
            href="/notices" 
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>목록으로</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 