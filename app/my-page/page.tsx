"use client";
import { useUser } from "@clerk/nextjs";
import { factories } from "@/lib/factories";
import { matchRequests } from "@/lib/matchRequests";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  const { user } = useUser();
  const [myFactories, setMyFactories] = useState(factories);
  const [editMode, setEditMode] = useState(false);
  const [factoryName, setFactoryName] = useState("");
  const [factoryDesc, setFactoryDesc] = useState("");
  const [editRoleMode, setEditRoleMode] = useState(false);
  const [newRole, setNewRole] = useState(user?.publicMetadata?.role || "");
  const [role, setRole] = useState(user?.publicMetadata?.role || "");

  if (!user) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  // 내 매칭 내역
  const myDesignerRequests = matchRequests.filter(r => r.designerUserId === user.id);
  const myFactoryIds = factories.filter(f => f.ownerUserId === user.id).map(f => f.id);
  const myFactoryRequests = matchRequests.filter(r => myFactoryIds.includes(r.factoryId));

  // 내 공장 정보(공장회원만)
  const myFactory = factories.find(f => f.ownerUserId === user.id);

  const handleFactoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setMyFactories(facs => facs.map(f => f.id === myFactory?.id ? { ...f, name: factoryName, description: factoryDesc } : f));
    setEditMode(false);
  };

  // 역할 변경 핸들러(실제 서비스라면 Supabase users 테이블 업데이트 필요)
  const handleRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(newRole);
    setEditRoleMode(false);
    // 실제로는 Supabase users 테이블의 role 필드 업데이트 필요
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-toss-blue mb-6">마이페이지</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="mb-2 font-bold">내 정보</div>
        <div className="mb-1 text-sm">이메일: {user.emailAddresses?.[0]?.emailAddress}</div>
        <div className="mb-1 text-sm flex items-center gap-2">
          역할: {role === "designer" ? "디자이너" : role === "factory" ? "공장" : <span className="text-red-500">(미선택)</span>}
          {(!role || editRoleMode) && (
            <form onSubmit={handleRoleChange} className="flex gap-2 items-center mt-2">
              <select value={newRole || ""} onChange={e => setNewRole(e.target.value)} className="border rounded px-3 py-2">
                <option value="">역할 선택</option>
                <option value="designer">디자이너</option>
                <option value="factory">공장</option>
              </select>
              <Button type="submit" className="bg-toss-blue text-white">저장</Button>
              {role && <Button type="button" variant="outline" onClick={() => setEditRoleMode(false)}>취소</Button>}
            </form>
          )}
          {role && !editRoleMode && (
            <Button onClick={() => { setEditRoleMode(true); setNewRole(role); }} className="ml-2 bg-toss-blue text-white">역할 변경</Button>
          )}
        </div>
      </div>
      {role === "designer" && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="mb-2 font-bold">내 매칭 요청</div>
          {myDesignerRequests.length === 0 ? (
            <div className="text-gray-500">보낸 매칭 요청이 없습니다.</div>
          ) : (
            <ul className="space-y-2">
              {myDesignerRequests.map(req => (
                <li key={req.id} className="border-b pb-2">
                  <div className="text-toss-blue font-semibold">공장 ID: {req.factoryId}</div>
                  <div className="text-sm text-gray-700">{req.content}</div>
                  <div className="text-xs text-gray-500">상태: {req.status} | 요청일: {req.createdAt}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {role === "factory" && (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="mb-2 font-bold">내 공장 정보</div>
            {myFactory ? (
              editMode ? (
                <form onSubmit={handleFactoryEdit} className="flex flex-col gap-2">
                  <input
                    value={factoryName}
                    onChange={e => setFactoryName(e.target.value)}
                    placeholder="공장명"
                    className="border rounded px-3 py-2"
                  />
                  <textarea
                    value={factoryDesc}
                    onChange={e => setFactoryDesc(e.target.value)}
                    placeholder="공장 소개"
                    className="border rounded px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-toss-blue text-white">저장</Button>
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>취소</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-bold text-toss-blue mb-1">{myFactory.name}</div>
                  <div className="text-sm text-gray-700 mb-2">{myFactory.description}</div>
                  <Button onClick={() => { setEditMode(true); setFactoryName(myFactory.name); setFactoryDesc(myFactory.description); }} className="bg-toss-blue text-white">수정</Button>
                </>
              )
            ) : (
              <div className="text-gray-500">등록된 공장 정보가 없습니다.</div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="mb-2 font-bold">내 공장에 온 매칭 요청</div>
            {myFactoryRequests.length === 0 ? (
              <div className="text-gray-500">받은 매칭 요청이 없습니다.</div>
            ) : (
              <ul className="space-y-2">
                {myFactoryRequests.map(req => (
                  <li key={req.id} className="border-b pb-2">
                    <div className="text-toss-blue font-semibold">디자이너 ID: {req.designerUserId}</div>
                    <div className="text-sm text-gray-700">{req.content}</div>
                    <div className="text-xs text-gray-500">상태: {req.status} | 요청일: {req.createdAt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
} 