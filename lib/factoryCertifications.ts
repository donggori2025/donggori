// Qualification holders confirmed by the operator on 2026-10-06.
// ponytail: five curated businesses; move to an admin-managed DB field when the roster grows.
const SEWING_CERTIFIED_FACTORIES = new Set([
  "꼬메오패션", "호프", "케이스타일", "더시크컴퍼니", "재희패턴",
]);

export function getFactoryCertifications(companyName: string): string[] {
  return SEWING_CERTIFIED_FACTORIES.has(companyName) ? ["봉제기능사"] : [];
}
