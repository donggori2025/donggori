"use client";

import { useAppAuth } from "@/contexts/AuthContext";
import MyPageLayout from "@/components/MyPageLayout";
import { useState } from "react";

export default function MyPageProfile() {
  const { user } = useAppAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage("현재 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setMessage(data.success ? "비밀번호가 변경되었습니다." : data.error || "변경에 실패했습니다.");
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MyPageLayout>
      <div className="max-w-xl mx-auto py-10 space-y-8">
        <h2 className="text-2xl font-bold">프로필 설정</h2>

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-lg font-semibold">내 정보</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">이름:</span> {user?.name || "-"}</p>
            <p><span className="font-medium text-gray-800">이메일:</span> {user?.email || "-"}</p>
            <p><span className="font-medium text-gray-800">전화번호:</span> {user?.phoneNumber || "-"}</p>
          </div>
        </div>

        {user?.signupMethod === "email" && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold">비밀번호 변경</h3>
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="새 비밀번호 (6자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
            {message && (
              <p className={`text-sm ${message.includes("성공") || message.includes("변경되었") ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </MyPageLayout>
  );
}
