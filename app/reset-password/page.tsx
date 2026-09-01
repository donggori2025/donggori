import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold">소셜 로그인을 이용해주세요</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          이메일 비밀번호 로그인은 현재 운영하지 않습니다. 카카오 또는 네이버 계정으로 로그인해주세요.
        </p>
        <Link href="/sign-in" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 font-semibold text-white">
          로그인으로 이동
        </Link>
      </section>
    </main>
  );
}
