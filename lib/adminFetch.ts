/** 관리자 API fetch — 401 시 로그인 페이지로 이동 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
  return res;
}
