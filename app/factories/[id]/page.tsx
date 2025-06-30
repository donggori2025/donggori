"use client";
import { use } from "react";
import { factories } from "@/lib/factories";
import { matchRequests } from "@/lib/matchRequests";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const factory = factories.find(f => f.id === id);
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!factory) {
    return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;
  }

  // 디자이너만 매칭 요청 가능
  const isDesigner = user?.publicMetadata?.role === "designer";

  // 이미 매칭 요청한 경우(샘플 데이터 기준)
  const alreadyRequested = user && matchRequests.some(r => r.factoryId === factory.id && r.designerUserId === user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowForm(false);
    // 실제로는 Supabase에 매칭 요청 insert 필요
  };

  // 카톡 문의하기 버튼 클릭 핸들러
  const handleKakaoInquiry = () => {
    if (!user) return;
    // 문의 내역 객체 생성
    const inquiry = {
      id: Date.now(), // 고유값(타임스탬프)
      factoryId: factory.id,
      factoryName: factory.name,
      date: new Date().toISOString().slice(0, 10),
      status: "카톡 문의 완료",
      method: "카카오톡",
      image: factory.image,
    };
    // 기존 문의 내역 불러오기
    const prev = JSON.parse(localStorage.getItem("inquiries") || "[]");
    // 새 문의 내역 추가
    localStorage.setItem("inquiries", JSON.stringify([inquiry, ...prev]));
    // 카카오톡 오픈채팅/1:1 링크로 이동(예시)
    window.open(factory.kakaoUrl || "https://open.kakao.com/o/some-link", "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-toss-blue">{factory.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image src={factory.image} alt={factory.name} width={600} height={224} className="rounded-xl mb-4 w-full h-56 object-cover" />
          <div className="mb-2 text-gray-700">{factory.description}</div>
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className="bg-toss-gray rounded px-2 py-1">{factory.region}</span>
            {factory.items.map(i => <span key={i} className="bg-toss-gray rounded px-2 py-1">{i}</span>)}
            <span className="bg-toss-gray rounded px-2 py-1">최소 {factory.minOrder}장</span>
          </div>
          <div className="mb-2 text-sm text-gray-500">연락처: {factory.contact}</div>
          {/* 카톡 문의하기 버튼 */}
          <Button
            onClick={handleKakaoInquiry}
            className="w-full bg-yellow-400 text-black rounded-full font-bold py-3 mt-4 hover:bg-yellow-300 transition-colors text-lg"
          >
            카톡으로 문의하기
          </Button>
        </CardContent>
      </Card>
      {isDesigner && !alreadyRequested && !submitted && (
        <div className="mb-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-toss-gray rounded-xl p-4">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="매칭 요청 내용을 입력하세요"
                className="border rounded px-3 py-2 min-h-[80px]"
                required
              />
              <Button type="submit" className="w-full bg-toss-blue text-white rounded-full font-bold py-2 hover:bg-blue-600 transition-colors">매칭 요청 보내기</Button>
            </form>
          ) : (
            <Button onClick={() => setShowForm(true)} className="w-full bg-toss-blue text-white rounded-full font-bold py-2 hover:bg-blue-600 transition-colors">매칭 요청하기</Button>
          )}
        </div>
      )}
      {alreadyRequested && (
        <div className="mb-6 text-center text-toss-blue font-semibold">이미 매칭 요청을 보냈습니다.</div>
      )}
      {submitted && (
        <div className="mb-6 text-center text-toss-blue font-semibold">매칭 요청이 정상적으로 접수되었습니다.</div>
      )}
      <div className="text-center">
        <Link href="/factories" className="text-toss-blue hover:underline">← 봉제공장 목록으로</Link>
      </div>
    </div>
  );
} 