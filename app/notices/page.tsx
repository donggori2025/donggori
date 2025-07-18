import React from "react";

const notices = [
  { title: "플랫폼 오픈 안내", date: "2025.06.23" },
  { title: "매칭 서비스 베타 오픈", date: "2025.06.24" },
  { title: "채용공고 안내", date: "2025.06.25" },
  { title: "공장 데이터 업데이트", date: "2025.06.26" },
  { title: "서비스 점검 안내", date: "2025.06.27" },
];

export default function NoticesPage() {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-2xl font-extrabold mb-4">공지사항</h2>
        <ul className="divide-y divide-gray-200">
          {notices.slice(0, 5).map((notice, idx) => (
            <li key={idx} className="flex justify-between items-center py-4">
              <span className="text-gray-800 font-medium">{notice.title}</span>
              <span className="text-gray-400 text-sm">{notice.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
} 