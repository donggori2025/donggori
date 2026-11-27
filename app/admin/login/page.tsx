"use client";
import React from "react";
import { useState } from "react";
import "../coordinator.css";

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
      window.location.href = "/admin/coordinator";
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coord-login">
      <form onSubmit={onSubmit} className="coord-login-form">
        <img src="/logo_donggori_0914_transparent.svg" width={100} height={33} alt="동고리" />
        <h1>관리자 로그인</h1>
        <label>아이디<input required autoComplete="username" value={id} onChange={e => setId(e.target.value)} /></label>
        <label>비밀번호<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p role="alert">{error}</p>}
        <button disabled={loading}>{loading ? "로그인 중…" : "로그인"}</button>
      </form>
    </div>
  );
}
