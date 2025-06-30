"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomSignUpPage() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("designer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!signUp) {
      setError("회원가입 기능을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
      return;
    }
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        // Clerk 회원가입 성공 후 Supabase에 role 저장
        await supabase.from("users").insert({
          id: result.createdUserId,
          email,
          role,
        });
        router.push("/sign-in");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (err: unknown) {
      // 타입가드로 에러 메시지 추출
      if (
        typeof err === "object" &&
        err !== null &&
        "errors" in err &&
        Array.isArray((err as { errors?: unknown }).errors)
      ) {
        setError((err as { errors?: { message?: string }[] }).errors?.[0]?.message || "회원가입 중 오류가 발생했습니다.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border rounded px-3 py-2"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="designer">디자이너</option>
              <option value="factory">공장</option>
            </select>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || !signUp}>
              {loading ? "가입 중..." : "회원가입"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 