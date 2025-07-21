"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMatchRequestById, MatchRequest } from "@/lib/matchRequests";

export default function MyRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<MatchRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const requestData = await getMatchRequestById(requestId);
        if (requestData) {
          setRequest(requestData);
        }
      } catch (error) {
        console.error('의뢰내역 조회 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestData();
  }, [requestId]);

  if (loading) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로딩 중...</div>;
  }

  if (!request) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">의뢰내역을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로 가기
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">의뢰 상세보기</h1>
            <p className="text-gray-600">의뢰 ID: {request.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {request.status === 'pending' ? '대기중' :
               request.status === 'accepted' ? '수락됨' :
               request.status === 'rejected' ? '거절됨' :
               '완료됨'}
            </span>
          </div>
        </div>

        {/* 공장 정보 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">공장 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">공장명</p>
              {/* @ts-ignore */}
              <p className="text-lg text-gray-900">{request.factoryName || request['factory_name'] || '공장명 없음'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">연락처</p>
              <p className="text-lg text-gray-900">{request.contact}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">의뢰일</p>
              <p className="text-lg text-gray-900">
                {request.created_at ? new Date(request.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : request.requestDate || '날짜 없음'}
              </p>
            </div>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 설명</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-900 leading-relaxed">{request.description}</p>
          </div>
        </div>

        {/* 추가 요청사항 */}
        {(request.additional_info || request.additionalInfo) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 요청사항</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              {(() => {
                try {
                  const additionalInfo = JSON.parse(request.additional_info || request.additionalInfo || '{}');
                  return (
                    <div className="space-y-6">
                      {/* 브랜드 정보 */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">브랜드 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">브랜드명</p>
                            <p className="text-gray-900">{additionalInfo.brandName || '미입력'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">선택 서비스</p>
                            <p className="text-gray-900">
                              {(() => {
                                const serviceMap = {
                                  'standard': 'Standard (봉제공정)',
                                  'deluxe': 'Deluxe (패턴/샘플 + 공장)',
                                  'premium': 'Premium (올인원)'
                                };
                                return serviceMap[additionalInfo.selectedService as keyof typeof serviceMap] || '미선택';
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 보유 현황 */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">보유 현황</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">샘플</p>
                            <p className="text-gray-900">{additionalInfo.sample || '미보유'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">패턴</p>
                            <p className="text-gray-900">{additionalInfo.pattern || '미보유'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 추가 서비스 */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">추가 서비스</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">QC</p>
                            <p className="text-gray-900">{additionalInfo.qc || '미희망'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">시아게</p>
                            <p className="text-gray-900">{additionalInfo.finishing || '미희망'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">포장</p>
                            <p className="text-gray-900">{additionalInfo.packaging || '미희망'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 첨부 파일 */}
                      {additionalInfo.files && additionalInfo.files.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">첨부 파일</h3>
                          <div className="space-y-2">
                            {additionalInfo.files.map((file: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {file.startsWith('http') ? (
                                  <a href={file} download={file.split('/').pop() || undefined} className="text-blue-600 hover:text-blue-800 underline">
                                    {file.split('/').pop() || '파일 다운로드'}
                                  </a>
                                ) : (
                                  <span className="text-gray-900">{file}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 참고 링크 */}
                      {additionalInfo.links && additionalInfo.links.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">참고 링크</h3>
                          <div className="space-y-2">
                            {additionalInfo.links.map((link: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                  {link}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } catch {
                  return <p className="text-gray-900">상세 정보를 불러올 수 없습니다.</p>;
                }
              })()}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
} 