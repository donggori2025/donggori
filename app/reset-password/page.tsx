"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/otp";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verify' | 'password'>('phone');
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 전화번호 유효성 검사
  const validatePhone = (phone: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 전화번호를 E164 형식으로 변환
  const formatPhoneToE164 = (phone: string) => {
    const cleaned = phone.replace(/-/g, '');
    return `+82${cleaned.substring(1)}`;
  };

  // 타이머 시작
  const startTimer = () => {
    setTimer(300); // 5분
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 타이머 정리
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 전화번호 인증 요청
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError("올바른 전화번호 형식이 아닙니다. (010-0000-0000)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const phoneE164 = formatPhoneToE164(phone);
      await requestPhoneOtp(phoneE164, 'reset');
      setStep('verify');
      startTimer();
    } catch (err: any) {
      setError(err.message || "인증번호 발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError("6자리 인증번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const phoneE164 = formatPhoneToE164(phone);
      await verifyPhoneOtp(phoneE164, verificationCode, 'reset');
      setStep('password');
      clearTimer();
    } catch (err: any) {
      setError(err.message || "인증번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatPhoneToE164(phone),
          newPassword
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "비밀번호 재설정에 실패했습니다.");
      }

      alert("비밀번호가 성공적으로 재설정되었습니다. 로그인해주세요.");
      router.push('/sign-in');
    } catch (err: any) {
      setError(err.message || "비밀번호 재설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 재발송
  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError("");
    try {
      const phoneE164 = formatPhoneToE164(phone);
      await requestPhoneOtp(phoneE164, 'reset');
      startTimer();
      setError("");
    } catch (err: any) {
      setError(err.message || "인증번호 재발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  React.useEffect(() => {
    return () => clearTimer();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="mb-8 flex flex-col items-center">
        <Image src="/logo_0624.svg" alt="동고리 로고" width={80} height={80} className="mb-2" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">DONG<span className="text-black">GORI</span></h1>
        <div className="text-lg font-semibold text-gray-700 mb-1">비밀번호 재설정</div>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">가입된 전화번호</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">가입 시 사용한 전화번호를 입력해주세요.</p>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : "인증번호 발송"}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">인증번호</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="6자리 인증번호"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? "재발송" : formatTime(timer)}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {phone}로 발송된 인증번호를 입력해주세요.
              </p>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : "인증번호 확인"}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">새 비밀번호</label>
              <input
                type="password"
                placeholder="새 비밀번호를 입력해주세요"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">6자 이상 입력해주세요.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">비밀번호 확인</label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : "비밀번호 재설정"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link href="/sign-in" className="text-gray-400 hover:text-black text-sm">
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
