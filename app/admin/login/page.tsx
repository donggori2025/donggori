"use client";
import React from "react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "로그인 실패");
      }
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err?.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-xl p-6 shadow-sm bg-white">
        <h1 className="text-xl font-bold mb-4">관리자 로그인</h1>
        <div className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="아이디" value={id} onChange={(e)=>setId(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="비밀번호" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50">{loading ? "로그인 중..." : "로그인"}</button>
        </div>
        
      </form>
    </div>
  );
}


