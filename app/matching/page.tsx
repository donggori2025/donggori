"use client";
import { useUser } from "@clerk/nextjs";
import { matchRequests } from "@/lib/matchRequests";
import { factories } from "@/lib/factories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function MatchingPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState(matchRequests);

  if (!user) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  const role = user.publicMetadata?.role;

  // 디자이너: 내가 보낸 요청
  if (role === "designer") {
    const myRequests = requests.filter(r => r.designerUserId === user.id);
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-toss-blue mb-6">내 매칭 요청</h1>
        {myRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">보낸 매칭 요청이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {myRequests.map(req => {
              const factory = factories.find(f => f.id === req.factoryId);
              return (
                <div key={req.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
                  <div className="font-bold text-toss-blue">{factory?.name}</div>
                  <div className="text-sm text-gray-700">{req.content}</div>
                  <div className="text-xs text-gray-500">상태: {req.status} | 요청일: {req.createdAt}</div>
                  <Link href={`/factories/${factory?.id}`} className="text-xs text-toss-blue hover:underline">공장 상세보기</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 공장: 내 공장에 온 요청
  if (role === "factory") {
    // 내가 운영하는 공장 id
    const myFactoryIds = factories.filter(f => f.ownerUserId === user.id).map(f => f.id);
    const received = requests.filter(r => myFactoryIds.includes(r.factoryId));
    const handleStatus = (id: string, status: "수락" | "거절") => {
      setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
    };
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-toss-blue mb-6">받은 매칭 요청</h1>
        {received.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">받은 매칭 요청이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {received.map(req => {
              return (
                <div key={req.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
                  <div className="font-bold">디자이너 ID: {req.designerUserId}</div>
                  <div className="text-sm text-gray-700">{req.content}</div>
                  <div className="text-xs text-gray-500">상태: {req.status} | 요청일: {req.createdAt}</div>
                  {req.status === "대기" && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleStatus(req.id, "수락")} className="bg-toss-blue text-white rounded-full font-bold py-1 px-4">수락</Button>
                      <Button onClick={() => handleStatus(req.id, "거절")} className="bg-gray-200 text-gray-700 rounded-full font-bold py-1 px-4">거절</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">권한이 없습니다.</div>;
} 