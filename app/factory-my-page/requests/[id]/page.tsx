"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMatchRequestById, updateMatchRequestStatus } from "@/lib/matchRequests";
import { MatchRequest } from "@/lib/matchRequests";

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<MatchRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestData = async () => {
      // 로컬스토리지에서 봉제공장 인증 정보 확인
      const storedAuth = localStorage.getItem('factoryAuth');
      const userType = localStorage.getItem('userType');
      
      if (!storedAuth || userType !== 'factory') {
        router.push('/sign-in');
        return;
      }
      
      try {
        // 의뢰내역 상세 정보 가져오기
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
  }, [requestId, router]);

  const handleStatusUpdate = async (newStatus: MatchRequest['status']) => {
    if (!request) return;
    
    try {
      const success = await updateMatchRequestStatus(request.id, newStatus);
      if (success) {
        setRequest({ ...request, status: newStatus });
        alert(`의뢰가 ${newStatus === 'accepted' ? '수락' : '거절'}되었습니다.`);
      }
    } catch (error) {
      console.error('상태 업데이트 중 오류:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

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
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate('accepted')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  수락
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  거절
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 의뢰자 정보 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">의뢰자 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">이름</p>
              <p className="text-lg text-gray-900">{request.userName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">이메일</p>
              <p className="text-lg text-gray-900">{request.userEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">연락처</p>
              <p className="text-lg text-gray-900">{request.contact}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">의뢰일</p>
              <p className="text-lg text-gray-900">
                {request.created_at ? 
                  new Date(request.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  request.requestDate || '날짜 없음'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 의뢰 내용 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">의뢰 내용</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">브랜드명</p>
              <p className="text-lg text-gray-900">
                {request.additional_info ? 
                  (() => {
                    try {
                      const additionalInfo = JSON.parse(request.additional_info);
                      return additionalInfo.brandName || '미입력';
                    } catch {
                      return '미입력';
                    }
                  })() : '미입력'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">선택 서비스</p>
              <p className="text-lg text-gray-900">
                {request.additional_info ? 
                  (() => {
                    try {
                      const additionalInfo = JSON.parse(request.additional_info);
                      const serviceMap = {
                        'standard': 'Standard (봉제공정)',
                        'deluxe': 'Deluxe (패턴/샘플 + 공장)',
                        'premium': 'Premium (올인원)'
                      };
                      return serviceMap[additionalInfo.selectedService as keyof typeof serviceMap] || '미선택';
                    } catch {
                      return '미선택';
                    }
                  })() : '미선택'
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">제작 품목</p>
              <p className="text-lg text-gray-900">{request.items.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">수량</p>
              <p className="text-lg text-gray-900">{request.quantity}개</p>
            </div>
            {request.deadline && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">납기일</p>
                <p className="text-lg text-gray-900">{request.deadline}</p>
              </div>
            )}
            {request.budget && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">예산</p>
                <p className="text-lg text-gray-900">{request.budget}</p>
              </div>
            )}
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
        {request.additional_info && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 정보</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              {(() => {
                try {
                  const additionalInfo = JSON.parse(request.additional_info);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">샘플 보유 여부</p>
                          <p className="text-gray-900">{additionalInfo.sample || '미보유'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">패턴 보유 여부</p>
                          <p className="text-gray-900">{additionalInfo.pattern || '미보유'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">QC 서비스</p>
                          <p className="text-gray-900">{additionalInfo.qc || '미희망'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">시아게 서비스</p>
                          <p className="text-gray-900">{additionalInfo.finishing || '미희망'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">포장 서비스</p>
                          <p className="text-gray-900">{additionalInfo.packaging || '미희망'}</p>
                        </div>
                      </div>
                      
                      {additionalInfo.links && additionalInfo.links.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">참고 링크</p>
                          <div className="space-y-1">
                            {additionalInfo.links.map((link: string, index: number) => (
                              <p key={index} className="text-gray-900 break-all">
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {link}
                                </a>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {additionalInfo.files && additionalInfo.files.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">첨부 파일</p>
                          <div className="space-y-1">
                            {additionalInfo.files.map((file: string, index: number) => (
                              <p key={index} className="text-gray-900">{file}</p>
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
          {request.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('accepted')}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              의뢰 수락
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 