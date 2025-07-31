import React from 'react';

interface PricingTableProps {
  className?: string;
}

export default function PricingTable({ className = "" }: PricingTableProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 제목 */}
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">(종합)기본공임표</h3>
        <p className="text-sm text-gray-600 mt-1">2024년</p>
      </div>

      {/* 메인 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200">구분</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200">품명</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">패턴</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">샘플</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">그레이딩</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">요척</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">재출력</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">6-20</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">30</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700">50</th>
            </tr>
          </thead>
          <tbody>
            {/* 1차 개발비 - 다이마루 */}
            <tr className="bg-blue-50">
              <td className="px-2 py-2 font-semibold text-blue-800 border-r border-gray-200" rowSpan={6}>1차 개발비</td>
              <td className="px-2 py-2 border-r border-gray-200">나시티</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">10,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">5,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">16,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">11,000</td>
              <td className="px-2 py-2 text-center">8,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">라운드티</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">50,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">50,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">10,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">5,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">18,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">13,000</td>
              <td className="px-2 py-2 text-center">10,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">맨투맨</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">60,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">70,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">8,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center">17,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">후드티</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">70,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">80,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">10,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center">22,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">츄리닝바지</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">70,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">10,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">35,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center">27,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">후드집업</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">110,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">45,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center">37,000</td>
            </tr>

            {/* 1차 개발비 - 우븐 */}
            <tr className="bg-green-50">
              <td className="px-2 py-2 font-semibold text-green-800 border-r border-gray-200" rowSpan={8}>1차 개발비</td>
              <td className="px-2 py-2 border-r border-gray-200">가디건</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">80,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">10,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">35,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center">27,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">셔츠</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">100,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">35,000</td>
              <td className="px-2 py-2 text-center">32,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">스커트</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">110,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">45,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center">37,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">바지</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">100,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">120,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">35,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">50,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">45,000</td>
              <td className="px-2 py-2 text-center">42,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">원피스</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">100,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">120,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">35,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">15,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">55,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">50,000</td>
              <td className="px-2 py-2 text-center">47,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">자켓</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">150,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">170,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">40,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">80,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">75,000</td>
              <td className="px-2 py-2 text-center">70,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">점퍼</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">160,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">180,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">45,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">20,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">85,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">80,000</td>
              <td className="px-2 py-2 text-center">75,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">코트</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">170,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">190,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">50,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">95,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">90,000</td>
              <td className="px-2 py-2 text-center">85,000</td>
            </tr>

            {/* Lv 3 우븐 */}
            <tr className="bg-purple-50">
              <td className="px-2 py-2 font-semibold text-purple-800 border-r border-gray-200" rowSpan={4}>1차 개발비</td>
              <td className="px-2 py-2 border-r border-gray-200">패딩톱바</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">200,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">230,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">55,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">120,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">115,000</td>
              <td className="px-2 py-2 text-center">110,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">바바리</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">200,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">230,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">55,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">125,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">120,000</td>
              <td className="px-2 py-2 text-center">115,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">다운점퍼</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">220,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">250,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">55,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">130,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">125,000</td>
              <td className="px-2 py-2 text-center">120,000</td>
            </tr>
            <tr>
              <td className="px-2 py-2 border-r border-gray-200">후드야상</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">230,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">280,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">55,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">25,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">30,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">140,000</td>
              <td className="px-2 py-2 text-center border-r border-gray-200">135,000</td>
              <td className="px-2 py-2 text-center">130,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 하단 참고사항 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="space-y-2 text-sm text-gray-700">
          <p>• 안감 포함된 비용입니다. (언밸런스 안감은 30%추가)</p>
          <p>• 라이너는 별도로 비용이 발생 합니다.</p>
          <p>• 셀업의 경우 기본공임 합계에서 일부 할인됩니다.</p>
        </div>
      </div>
    </div>
  );
} 