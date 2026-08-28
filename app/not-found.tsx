import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-gray-500">404</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-gray-600">주소가 변경되었거나 더 이상 제공되지 않는 페이지입니다.</p>
      <Link href="/" className="mt-7 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white">홈으로 돌아가기</Link>
    </section>
  );
}
