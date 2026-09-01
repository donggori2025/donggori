"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRoundX } from "lucide-react";
import { AvatarMaker } from "@/components/avatar-maker";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { displayAccount, marketingConsent, updateDisplayAccount, updateAvatar, setMarketingConsent } = useWorkspace();
  const [name, setName] = useState(displayAccount.name);
  const [profileSaved, setProfileSaved] = useState(false);
  const [makerOpen, setMakerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    setName(displayAccount.name);
  }, [displayAccount.name]);

  useEffect(() => {
    if (!profileSaved) return;
    const t = window.setTimeout(() => setProfileSaved(false), 2400);
    return () => window.clearTimeout(t);
  }, [profileSaved]);

  useEffect(() => {
    if (!passwordMessage?.ok) return;
    const t = window.setTimeout(() => setPasswordMessage(null), 2400);
    return () => window.clearTimeout(t);
  }, [passwordMessage]);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const next = name.trim();
    if (!next) return;
    updateDisplayAccount(next);
    setProfileSaved(true);
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ ok: false, text: "모든 비밀번호 칸을 입력해 주세요." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ ok: false, text: "새 비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordMessage({ ok: false, text: "현재 비밀번호와 다른 비밀번호를 입력해 주세요." });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage({ ok: true, text: "비밀번호가 변경되었습니다." });
  }

  function logout() {
    if (window.confirm("로그아웃할까요?")) router.push("/dashboard");
  }

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
      <div className="mx-auto max-w-7xl space-y-5 px-8 py-8">
        <header>
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Account</p>
          <h1 className="mt-1 text-[36px] font-semibold leading-none tracking-tight">마이 프로필</h1>
          <p className="mt-2 text-[14px] text-stone">이름과 얼굴, 비밀번호, 마케팅 수신 동의를 관리합니다.</p>
        </header>

        <section className="rounded-2xl border border-mist bg-snow p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">프로필 수정</h2>
          <p className="mt-1 text-[13px] text-stone">사이드바에 표시되는 이름과 이메일을 확인합니다.</p>
          <form className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start" onSubmit={saveProfile}>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setMakerOpen(true)}
                className="rounded-full outline-none ring-offset-2 hover:ring-2 hover:ring-fog"
                aria-label="얼굴 만들기"
              >
                <ProfileAvatar size={72} />
              </button>
              <button
                type="button"
                onClick={() => setMakerOpen(true)}
                className="text-[12px] font-medium text-ink underline-offset-2 hover:underline"
              >
                얼굴 만들기
              </button>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-stone">이름</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-mist bg-paper px-4 text-[14px] outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-stone">이메일</span>
                <input
                  value={displayAccount.email}
                  readOnly
                  className="h-11 w-full cursor-default rounded-2xl border border-mist bg-paper/70 px-4 text-[14px] text-stone outline-none"
                />
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button type="submit" className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[13px] text-snow">
                  저장
                </button>
                {profileSaved && <p className="text-[13px] text-mint-ink">프로필이 저장되었습니다.</p>}
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-mist bg-snow p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">비밀번호 변경</h2>
          <p className="mt-1 text-[13px] text-stone">데모에서는 실제 인증 없이 입력값만 확인합니다.</p>
          <form className="mt-5 max-w-md space-y-3" onSubmit={changePassword}>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-stone">현재 비밀번호</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-mist bg-paper px-4 text-[14px] outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-stone">새 비밀번호</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-mist bg-paper px-4 text-[14px] outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-stone">새 비밀번호 확인</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-mist bg-paper px-4 text-[14px] outline-none"
              />
            </label>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[13px] text-snow">
                변경
              </button>
              {passwordMessage && (
                <p className={cn("text-[13px]", passwordMessage.ok ? "text-mint-ink" : "text-danger")}>
                  {passwordMessage.text}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-mist bg-snow p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">마케팅 정보 수신 동의</h2>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
            />
            <span>
              <span className="block text-[14px] font-medium">이벤트·신규 기능 소식을 이메일로 받습니다</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-stone">
                제품 업데이트, 시즌 템플릿, 워크스페이스 혜택 안내가 발송됩니다. 언제든지 끌 수 있습니다.
              </span>
            </span>
          </label>
        </section>

        <section className="rounded-2xl border border-mist bg-snow p-6">
          <h2 className="text-[15px] font-semibold tracking-tight">로그아웃</h2>
          <p className="mt-1 text-[13px] text-stone">이 기기에서 세션을 종료하고 대시보드로 이동합니다.</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-mist bg-paper px-4 text-[13px] text-danger"
          >
            <LogOut size={14} strokeWidth={1.7} />
            로그아웃
          </button>
        </section>

        <section className="rounded-2xl border border-rose bg-snow p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-danger">회원탈퇴</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-stone">
            계정을 삭제하면 워크스페이스와 제품 접근이 종료됩니다. 데모에서는 확인 후 대시보드로 이동합니다.
          </p>
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-danger px-4 text-[13px] text-snow"
          >
            <UserRoundX size={14} strokeWidth={1.7} />
            회원탈퇴
          </button>
        </section>
      </div>

      {withdrawOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={() => setWithdrawOpen(false)}
        >
          <div
            className="w-[400px] rounded-3xl bg-snow p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="withdraw-title"
          >
            <p id="withdraw-title" className="text-[18px] font-semibold tracking-tight">
              정말 탈퇴할까요?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-stone">
              이 동작은 데모용입니다. 확인하면 대시보드로 이동합니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWithdrawOpen(false)}
                className="rounded-full px-3 py-1.5 text-[13px] text-stone"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setWithdrawOpen(false);
                  router.push("/dashboard");
                }}
                className="rounded-full bg-danger px-4 py-1.5 text-[13px] text-snow"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
      {makerOpen && (
        <AvatarMaker
          initial={displayAccount.avatar}
          onClose={() => setMakerOpen(false)}
          onApply={(avatar) => {
            updateAvatar(avatar);
            setMakerOpen(false);
          }}
        />
      )}
    </div>
  );
}
