"use client";

import { useParams } from "next/navigation";

const TERMS_DATA: Record<string, { title: string; content: string }> = {
  service: {
    title: "이용약관(임시)",
    content: `이곳은 서비스 이용약관 임시 데이터입니다.\n\n1. 목적\n2. 이용조건\n3. 기타 조항 ...`,
  },
  privacy: {
    title: "개인정보이용동의(임시)",
    content: `이곳은 개인정보이용동의 임시 데이터입니다.\n\n1. 수집항목\n2. 이용목적\n3. 보유기간 ...`,
  },
  marketing: {
    title: "마케팅정보활용동의(임시)",
    content: `이곳은 마케팅정보활용동의 임시 데이터입니다.\n\n1. 수집 및 이용목적\n2. 제공항목 ...`,
  },
};

export default function TermsDetailPage() {
  const params = useParams();
  const type = params?.type as string;
  const data = TERMS_DATA[type] || { title: "약관", content: "임시 약관 내용입니다." };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm">{data.content}</pre>
    </div>
  );
} 