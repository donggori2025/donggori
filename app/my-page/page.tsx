"use client";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { factories } from "@/lib/factories";
import { matchRequests } from "@/lib/matchRequests";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// 샘플 문의내역 데이터
// const sampleInquiries = [
//   { id: 1, title: "문의 1", content: "문의 내용 1", date: "2024-07-01" },
//   { id: 2, title: "문의 2", content: "문의 내용 2", date: "2024-07-02" },
// ];

const SIDEBAR_MENUS = ["프로필", "문의내역"] as const;
type SidebarMenu = typeof SIDEBAR_MENUS[number];

interface Inquiry {
  id: number;
  userId: string;
  factoryId: string;
  factoryName: string;
  date: string;
  status: string;
  method: string;
  image: string;
}

export default function MyPage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState<SidebarMenu>("프로필");
  const [editMode, setEditMode] = useState(false);
  const [factoryName, setFactoryName] = useState("");
  const [factoryDesc, setFactoryDesc] = useState("");
  const [editRoleMode, setEditRoleMode] = useState(false);
  const [newRole, setNewRole] = useState(user?.publicMetadata?.role || "");
  const [role, setRole] = useState(user?.publicMetadata?.role || "");
  const [editImageMode, setEditImageMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">로그인 후 이용 가능합니다.</div>;
  }

  // 내 매칭 내역
  const myDesignerRequests = matchRequests.filter(r => r.designerUserId === user.id);
  const myFactory = factories.find(f => f.ownerUserId === user.id);

  const handleFactoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    // const [myFactories, setMyFactories] = useState(factories); // 사용되지 않으므로 삭제
    // const [myFactories, setMyFactories] = useState(facs => facs.map(f => f.id === myFactory?.id ? { ...f, name: factoryName, description: factoryDesc } : f));
    setEditMode(false);
  };

  // 역할 변경 핸들러(실제 서비스라면 Supabase users 테이블 업데이트 필요)
  const handleRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(newRole);
    setEditRoleMode(false);
    // 실제로는 Supabase users 테이블의 role 필드 업데이트 필요
  };

  // 프로필 이미지 변경 핸들러
  const handleImageChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) return;
    setLoading(true);
    try {
      await user.setProfileImage({ file: imageFile });
      setEditImageMode(false);
      setImageFile(null);
      setImagePreview(null);
    } catch {
      alert("프로필 이미지 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이미지 파일 선택 시 미리보기
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  console.log("Clerk user 객체:", user);

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">마이페이지</h1>
      <p className="text-lg text-gray-500 mb-8">내 정보와 문의내역을 확인할 수 있습니다.</p>
      <div className="flex flex-row gap-8 min-h-[500px]">
        {/* 왼쪽 사이드바: 메뉴만 */}
        <aside className="w-1/4 min-w-[220px] bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <nav className="w-full flex flex-col gap-2 mb-6">
            {SIDEBAR_MENUS.map((menu) => (
              <button
                key={menu}
                className={`w-full text-left px-4 py-2 rounded transition-colors
                  ${selectedMenu === menu
                    ? "bg-gray-100 text-black font-bold"
                    : "text-gray-700 hover:bg-gray-100"}
                `}
                onClick={() => setSelectedMenu(menu)}
              >
                {menu}
              </button>
            ))}
          </nav>
        </aside>
        {/* 오른쪽 메인 컨텐츠 */}
        <section className="flex-1 bg-white rounded-xl shadow p-8">
          {selectedMenu === "프로필" && (
            <div>
              {/* 프로필 사진, 변경 UI, 이메일, 로그아웃 버튼 */}
              <div className="flex flex-col items-center mb-8">
                <Image
                  src={user.imageUrl}
                  alt="프로필 이미지"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border mb-3"
                />
                {/* 프로필 이미지 변경 버튼 */}
                {!editImageMode ? (
                  <button className="text-xs text-blue-500 underline mb-2" onClick={() => setEditImageMode(true)}>
                    프로필 사진 변경
                  </button>
                ) : (
                  <form onSubmit={handleImageChange} className="flex flex-col items-center gap-2 mb-2">
                    <input type="file" accept="image/*" onChange={handleFileInput} />
                    {imagePreview && (
                      <Image src={imagePreview} alt="미리보기" width={64} height={64} className="w-16 h-16 rounded-full object-cover border" />
                    )}
                    <div className="flex gap-2">
                      <button type="submit" className="text-xs bg-toss-blue text-white px-2 py-1 rounded" disabled={loading}>저장</button>
                      <button type="button" className="text-xs bg-gray-200 px-2 py-1 rounded" onClick={() => { setEditImageMode(false); setImageFile(null); setImagePreview(null); }}>취소</button>
                    </div>
                  </form>
                )}
                <div className="text-gray-700 text-base mb-2">{user.emailAddresses?.[0]?.emailAddress}</div>
                <button
                  className="w-full mt-2 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                >
                  로그아웃
                </button>
              </div>
              {/* 기존 프로필 정보(역할 등) */}
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
              {/* 이하 기존 내용 유지 */}
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
                </>
              )}
            </div>
          )}
          {selectedMenu === "문의내역" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">문의내역</h2>
              {/* localStorage에서 내 문의내역 불러오기 */}
              {(() => {
                if (!user) return <div className="text-gray-500">로그인 후 이용 가능합니다.</div>;
                const allInquiries: Inquiry[] = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inquiries") || "[]") : [];
                // user.id가 있는 경우만 필터 (향후 Clerk 연동 시 user.id 저장 필요)
                const myInquiries = allInquiries.filter((inq) => inq.userId === user.id);
                if (myInquiries.length === 0) {
                  return <div className="text-gray-500">문의내역이 없습니다.</div>;
                }
                return (
                  <ul className="space-y-4">
                    {myInquiries.map((inq) => (
                      <Link
                        key={inq.id}
                        href={inq.factoryId ? `/factories/${inq.factoryId}` : "#"}
                        className="block border-b pb-2 flex items-center gap-4 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Image src={inq.image} alt="공장 이미지" width={64} height={64} className="w-16 h-16 rounded object-cover bg-gray-100" />
                        <div className="flex-1">
                          <div className="font-semibold text-toss-blue">{inq.factoryName}</div>
                          <div className="text-gray-700 text-sm mb-1">카카오톡 문의</div>
                          <div className="text-xs text-gray-400">{inq.date}</div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">카톡 문의 완료</span>
                      </Link>
                    ))}
                  </ul>
                );
              })()}
            </div>
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