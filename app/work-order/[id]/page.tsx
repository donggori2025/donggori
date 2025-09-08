'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';

interface MatchRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  factory_id: string;
  factory_name: string;
  status: string;
  items: any[];
  quantity: number;
  description: string;
  contact: string;
  deadline: string;
  budget: string;
  additional_info: string;
  created_at: string;
  updated_at: string;
}

interface Factory {
  id: string;
  company_name: string;
  name: string;
  phone_number: string;
  kakao_url: string;
  intro: string;
}

export default function WorkOrderDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<MatchRequest | null>(null);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!requestId) return;

    const fetchRequestData = async () => {
      try {
        // 의뢰 정보 가져오기
        const { data: requestData, error: requestError } = await supabase
          .from('match_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (requestError) {
          console.error('의뢰 정보 조회 오류:', requestError);
          setError('의뢰 정보를 찾을 수 없습니다.');
          return;
        }

        setRequest(requestData);

        // 추가 정보 파싱
        if (requestData.additional_info) {
          try {
            const parsed = JSON.parse(requestData.additional_info);
            setAdditionalInfo(parsed);
          } catch (e) {
            console.error('추가 정보 파싱 오류:', e);
          }
        }

        // 공장 정보 가져오기
        if (requestData.factory_id) {
          const { data: factoryData, error: factoryError } = await supabase
            .from('donggori')
            .select('*')
            .eq('id', parseInt(requestData.factory_id))
            .single();

          if (factoryError) {
            console.error('공장 정보 조회 오류:', factoryError);
          } else {
            setFactory(factoryData);
          }
        }
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestData();
  }, [requestId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">작업지시서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">작업지시서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">{error || '요청하신 작업지시서가 존재하지 않습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">작업지시서</h1>
              <p className="text-gray-600 mt-1">의뢰 ID: {request.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">의뢰일</p>
              <p className="font-semibold">{new Date(request.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">디자이너</label>
                  <p className="text-gray-900">{request.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <p className="text-gray-900">{request.contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명</label>
                  <p className="text-gray-900">{additionalInfo?.brandName || '미입력'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스</label>
                  <p className="text-gray-900">{additionalInfo?.serviceDetails?.deluxe?.title || 'Standard'}</p>
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            {additionalInfo?.detailDescription && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">상세 설명</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{additionalInfo.detailDescription}</p>
                </div>
              </div>
            )}

            {/* 상세 요청사항 */}
            {additionalInfo?.detailRequest && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">상세 요청사항</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{additionalInfo.detailRequest}</p>
                </div>
              </div>
            )}

            {/* 샘플/패턴 정보 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">샘플/패턴 유무</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">샘플</label>
                  <p className="text-gray-900">{additionalInfo?.sample || '미입력'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">패턴</label>
                  <p className="text-gray-900">{additionalInfo?.pattern || '미입력'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QC</label>
                  <p className="text-gray-900">{additionalInfo?.qc || '미입력'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시아게</label>
                  <p className="text-gray-900">{additionalInfo?.finishing || '미입력'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">포장</label>
                  <p className="text-gray-900">{additionalInfo?.packaging || '미입력'}</p>
                </div>
              </div>
            </div>

            {/* 참고 링크 */}
            {additionalInfo?.links && additionalInfo.links.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">참고 링크</h2>
                <div className="space-y-2">
                  {additionalInfo.links.map((link: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 첨부 파일 */}
            {additionalInfo?.files && additionalInfo.files.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">첨부 파일</h2>
                <div className="space-y-3">
                  {additionalInfo.files.map((file: string, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mr-3">
                        <Image 
                          src="/file.svg" 
                          alt="파일" 
                          width={24} 
                          height={24}
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">첨부 파일</p>
                      </div>
                      <div className="flex-shrink-0">
                        <a 
                          href={file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          다운로드
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 공장 정보 */}
            {factory && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">공장 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">공장명</label>
                    <p className="text-gray-900">{factory.company_name || factory.name}</p>
                  </div>
                  {factory.phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                      <p className="text-gray-900">{factory.phone_number}</p>
                    </div>
                  )}
                  {factory.kakao_url && (
                    <div>
                      <a 
                        href={factory.kakao_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                      >
                        <Image 
                          src="/kakao_lastlast.svg" 
                          alt="카카오톡" 
                          width={20} 
                          height={20}
                          className="w-5 h-5 mr-2"
                        />
                        카카오톡 문의
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 의뢰 상태 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">의뢰 상태</h3>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : request.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {request.status === 'pending' ? '대기중' : 
                   request.status === 'accepted' ? '승인됨' : '기타'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
