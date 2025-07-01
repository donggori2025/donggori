import React from "react";
import Image from "next/image";

// 더미 문의 내역 데이터
const inquiries = [
  {
    id: 1,
    factoryName: "동대문 봉제공장 A",
    content: "샘플 제작 단가와 납기 문의드립니다.",
    date: "2024-06-25",
    status: "답변 대기",
    image: "/window.svg", // 예시 이미지
  },
  {
    id: 2,
    factoryName: "동대문 봉제공장 B",
    content: "대량 생산 가능 여부와 최소 수량이 궁금합니다.",
    date: "2024-06-20",
    status: "답변 완료",
    image: "/file.svg",
  },
  {
    id: 3,
    factoryName: "동대문 봉제공장 C",
    content: "의류 라벨 부착 서비스도 제공하나요?",
    date: "2024-06-15",
    status: "답변 대기",
    image: "/globe.svg",
  },
];

// 문의 내역 카드 리스트 컴포넌트
export default function InquiryList() {
  return (
    <div>
      {/* 상단 타이틀 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-black font-bold">문의 내역</h2>
        {/* 상태 필터 등 추가 가능 */}
      </div>
      {/* 카드 리스트 */}
      <div className="flex flex-col gap-6">
        {inquiries.map((inq) => (
          <div key={inq.id} className="flex bg-white rounded-xl shadow p-6 items-center gap-6">
            {/* 공장 이미지 */}
            <Image src={inq.image} alt="공장 이미지" className="w-28 h-28 rounded-lg object-cover bg-gray-100" width={112} height={112} />
            {/* 문의 정보 */}
            <div className="flex-1">
              <div className="text-lg font-semibold mb-1">{inq.factoryName}</div>
              <div className="text-gray-700 mb-2">{inq.content}</div>
              <div className="text-sm text-gray-400">문의일: {inq.date}</div>
            </div>
            {/* 상태 및 버튼 */}
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${inq.status === "답변 완료" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{inq.status}</span>
              <button className="mt-2 px-4 py-2 bg-toss-blue text-white rounded font-semibold hover:bg-blue-700 transition-colors">상세보기</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 