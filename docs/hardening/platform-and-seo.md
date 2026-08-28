# Platform and SEO hardening

## Completed

- Public notice APIs and notice detail now select only public fields, require `is_active = true`, and enforce the scheduled visibility window. Admin notice validation now stores a strict `is_active` flag and validates dates.
- Admin popup listing is read-only. Duplicate cleanup remains an explicit admin action instead of a side effect of `GET`.
- Factory write routes now validate the allowlist, required create fields, string lengths, email, phone, URL, coordinates, numeric ranges, and image URL arrays. Admin image upload accepts only JPEG, PNG, WebP, and GIF, uses generated names, and limits Blob deletion to Vercel Blob URLs.
- Public metadata has a canonical base, Open Graph data, a stable sitemap, private-route `noindex`, and `robots.txt` exclusions. User-facing `not-found`, route error, and global error pages were added.
- Next.js now keeps its default chunking, removes the obsolete `X-XSS-Protection` header, and adds HSTS, a restrictive permissions policy, COOP, and stricter referrer policy.
- OAuth/map IDs have no source-code fallbacks. Server Supabase access fails closed when required service configuration is absent; the legacy browser client no longer returns fake successful results.
- The admin factory export is UTF-8 CSV, removing `xlsx` from production dependencies. Confirmed unused runtime dependencies (`@react-google-maps/api`, `framer-motion`, `@tailwindcss/line-clamp`) and the unused Bun lockfile were removed. `xlsx` remains a development dependency for the explicitly named legacy import/export scripts.
- `npm run lint`, `typecheck`, and `verify` are defined, and GitHub Actions runs `npm ci` plus `npm run verify`.

## Required Vercel and Supabase settings

1. Set production, preview, and development values for `NEXT_PUBLIC_SITE_URL`, Supabase URL/service-role key, distinct `SESSION_SECRET` and `ADMIN_SESSION_SECRET`, both OAuth client IDs/secrets, and the Naver map client ID. The runtime no longer uses the Supabase anon key or browser table access. OAuth and map IDs fail visibly when omitted instead of falling back to old source-code values.
2. Apply the database migration that adds `notices.is_active` before deploying this change. Without it, public notice queries deliberately fail rather than exposing inactive notices.
3. Add Vercel WAF firewall rules for `/api/admin/login`, `/api/auth/login`, `/api/auth/email/request`, and `/api/auth/email/verify`: block or challenge repeated failed or excessive requests (the current baseline is five failures in 15 minutes for admin login). The existing in-process limiter is only best effort and is not durable across Vercel instances; it must not be treated as the primary control.
4. Confirm every custom domain serves HTTPS before relying on HSTS. Do not set a CSP until external image, Naver Maps, Kakao, and Supabase origins have been inventoried and tested.

## Validation

Run from the repository root:

```sh
npm run test:security
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

The implementation pass records actual results in the main hardening log after integration.

### This implementation pass

- `npm run test:security`: passed (4/4).
- `npm run lint`: completed with 0 errors (legacy warnings remain non-fatal). CI can prevent correctness regressions without blocking on the separate cleanup backlog.
- `npm run typecheck`: passed.
- `npm audit --omit=dev`: 네트워크 권한으로 재검증해 `0 vulnerabilities`를 확인했다.
- `npm run build`: 안전한 CI용 필수 환경변수를 주입한 로컬 production build가 통과했다. Google Fonts 런타임 다운로드 의존성은 시스템 폰트로 교체했다. 실제 Vercel 환경변수와 외부 OAuth 왕복은 Preview에서 별도 확인한다.
