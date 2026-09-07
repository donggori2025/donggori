"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppAuth } from "@/contexts/AuthContext";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import type { MatchRequest } from "@/lib/matchRequests";

type Menu = "profile" | "requests";

const STATUS_LABELS: Record<MatchRequest["status"], string> = {
  pending: "접수 대기",
  accepted: "진행 중",
  rejected: "반려",
  completed: "완료",
};

const STATUS_STYLES: Record<MatchRequest["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
};

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

export default function MyPage() {
  const { user, isSignedIn, isLoaded, signOut, refresh } = useAppAuth();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu>("profile");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?next=/my-page");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    setName(user?.name || "");
    setPhoneNumber(user?.phoneNumber || "");
  }, [user]);

  useEffect(() => {
    if (!isSignedIn || menu !== "requests") return;

    let cancelled = false;
    const loadRequests = async () => {
      setRequestsLoading(true);
      setRequestsError("");
      try {
        const response = await fetch("/api/match-requests", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "의뢰내역을 불러오지 못했습니다.");
        if (!cancelled) setRequests(Array.isArray(payload.data) ? payload.data : []);
      } catch (error) {
        if (!cancelled) {
          setRequestsError(error instanceof Error ? error.message : "의뢰내역을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setRequestsLoading(false);
      }
    };

    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, menu]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError(false);

    const normalizedName = name.trim();
    const normalizedPhone = phoneNumber.trim();
    if (!normalizedName || normalizedName.length > 50) {
      setProfileMessage("이름은 1~50자로 입력해주세요.");
      setProfileError(true);
      return;
    }
    if (normalizedPhone && !/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/.test(normalizedPhone)) {
      setProfileMessage("연락처를 올바르게 입력해주세요.");
      setProfileError(true);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: normalizedName, phoneNumber: normalizedPhone }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "프로필을 저장하지 못했습니다.");
      await refresh();
      setProfileMessage("프로필을 저장했습니다.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "프로필을 저장하지 못했습니다.");
      setProfileError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" aria-label="로그인 정보 확인 중" />
      </div>
    );
  }

  return (
    <main className={`${PAGE_CONTAINER_CLASS} py-10 md:py-14`}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-violet-600">MY DONGGORI</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-sm text-gray-500">프로필과 내가 등록한 의뢰를 관리합니다.</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="마이페이지 메뉴" className="h-fit rounded-2xl border border-gray-200 bg-white p-2">
          {([
            ["profile", "프로필"],
            ["requests", "의뢰내역"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMenu(value)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                menu === value ? "bg-violet-600 text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {menu === "profile" ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <div className="mb-7 flex items-center gap-4 border-b border-gray-100 pb-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-gray-900">{user.name || "사용자"}</h2>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="max-w-xl space-y-5">
              <label className="block text-sm font-medium text-gray-700">
                이름
                <input
                  required
                  maxLength={50}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-violet-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                이메일
                <input
                  readOnly
                  value={user.email}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                연락처
                <input
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(formatPhone(event.target.value))}
                  placeholder="010-1234-5678"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-violet-500"
                />
              </label>
              {profileMessage && (
                <p className={`text-sm ${profileError ? "text-red-600" : "text-emerald-700"}`}>{profileMessage}</p>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                저장하기
              </button>
            </form>

            <div className="mt-10 border-t border-gray-100 pt-7">
              <h3 className="text-base font-bold text-gray-900">계정 탈퇴 및 개인정보 요청</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                현재 자동 탈퇴 기능은 제공하지 않습니다. 본인 확인 후 처리할 수 있도록 아래 이메일로 요청해주세요.
              </p>
              <a
                href={`mailto:donggori2020@gmail.com?subject=${encodeURIComponent("동고리 계정 탈퇴 요청")}`}
                className="mt-3 inline-block text-sm font-semibold text-violet-700 underline"
              >
                donggori2020@gmail.com
              </a>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">의뢰내역</h2>
                <p className="mt-1 text-sm text-gray-500">내 계정으로 등록한 의뢰만 표시됩니다.</p>
              </div>
              <Link href="/factories" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                공장 찾기
              </Link>
            </div>

            {requestsLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
              </div>
            ) : requestsError ? (
              <div className="rounded-xl bg-red-50 px-4 py-8 text-center text-sm text-red-700">{requestsError}</div>
            ) : requests.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-12 text-center">
                <p className="font-semibold text-gray-800">등록한 의뢰가 없습니다.</p>
                <p className="mt-2 text-sm text-gray-500">공장 상세 화면에서 문의를 등록할 수 있습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/my-page/requests/${encodeURIComponent(request.id)}`}
                    className="flex flex-col gap-3 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">
                        {request.factory_name || request.factoryName || "디자인 의뢰"}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500">{request.description || "상세 내용 없음"}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {request.created_at ? new Date(request.created_at).toLocaleDateString("ko-KR") : "날짜 정보 없음"}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
