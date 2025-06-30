"use client";
import { useUser } from "@clerk/nextjs";
import { factories } from "@/lib/factories";
import { matchRequests } from "@/lib/matchRequests";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 샘플 문의내역 데이터
const sampleInquiries = [
  { id: 1, title: "문의 1", content: "문의 내용 1", date: "2024-07-01" },
  { id: 2, title: "문의 2", content: "문의 내용 2", date: "2024-07-02" },
];

const SIDEBAR_MENUS = ["프로필", "문의내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

export default function MyPage() {
  const { user } = useUser();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
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
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      {/* 공지사항과 동일한 제목 스타일 */}
      <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">마이페이지</h1>
      <p className="text-lg text-gray-500 mb-8">내 정보와 문의내역을 확인할 수 있습니다.</p>

      {/* 2단 레이아웃: 좌측 사이드바 + 우측 컨텐츠 */}
      <div className="flex flex-row gap-8 min-h-[500px]">
        {/* 좌측 사이드바 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 flex flex-col items-center">
          {/* 프로필 정보 */}
          <img
            src={user.imageUrl}
            alt="프로필 이미지"
            className="w-20 h-20 rounded-full object-cover border mb-3"
          />
          <div className="font-bold text-lg mb-1">{user.fullName || user.username || "이름 없음"}</div>
          <div className="text-gray-500 text-sm mb-6">{user.emailAddresses?.[0]?.emailAddress}</div>
          {/* 사이드 메뉴 */}
          <nav className="w-full flex flex-col gap-2">
            {SIDEBAR_MENUS.map((menu) => (
              <button
                key={menu}
                className={`w-full text-left px-4 py-2 rounded font-semibold transition-colors ${selectedMenu === menu ? "bg-toss-blue text-white" : "hover:bg-gray-100 text-gray-700"}`}
                onClick={() => setSelectedMenu(menu)}
              >
                {menu}
              </button>
            ))}
          </nav>
        </aside>
        {/* 우측 컨텐츠 */}
        <section className="flex-1 bg-white rounded-xl shadow p-8">
          {selectedMenu === "프로필" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">프로필 정보</h2>
              <div className="mb-2">이름: <span className="font-semibold">{user.fullName || user.username || "이름 없음"}</span></div>
              <div className="mb-2">이메일: <span className="font-semibold">{user.emailAddresses?.[0]?.emailAddress}</span></div>
              {/* 추가 정보 필요시 여기에 추가 */}
            </div>
          )}
          {selectedMenu === "문의내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">문의내역</h2>
              {sampleInquiries.length === 0 ? (
                <div className="text-gray-500">문의내역이 없습니다.</div>
              ) : (
                <ul className="space-y-4">
                  {sampleInquiries.map((inq) => (
                    <li key={inq.id} className="border-b pb-2">
                      <div className="font-semibold text-toss-blue">{inq.title}</div>
                      <div className="text-gray-700 text-sm mb-1">{inq.content}</div>
                      <div className="text-xs text-gray-400">{inq.date}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {selectedMenu === "프로필" && (
            <>
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="mb-2 font-bold">내 정보</div>
                <div className="mb-1 text-sm">이메일: {user.emailAddresses?.[0]?.emailAddress}</div>
                <div className="mb-1 text-sm flex items-center gap-2">
                  역할: {role === "designer" ? "디자이너" : role === "factory" ? "공장" : <span className="text-red-500">(미선택)</span>}
                  {(!role || editRoleMode) && (
                    <form onSubmit={handleRoleChange} className="flex gap-2 items-center mt-2">
                      <select value={String(newRole) || ""} onChange={e => setNewRole(e.target.value)} className="border rounded px-3 py-2">
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
            </>
          )}
        </section>
      </div>
      {/*
        주니어 개발자 설명:
        - 2단 레이아웃은 flex로 구현, 좌측은 사이드바, 우측은 컨텐츠 영역입니다.
        - 사이드바 메뉴 클릭 시 selectedMenu 상태가 변경되어 우측 내용이 바뀝니다.
        - 프로필 정보는 Clerk의 useUser 훅에서 가져옵니다.
        - 문의내역은 샘플 데이터로, 실제 서비스에서는 API 연동 필요.
        - Tailwind CSS로 빠르게 스타일링할 수 있습니다.
      */}
    </div>
  );
} 