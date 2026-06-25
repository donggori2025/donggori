/** 출시 전까지 끌 수 있는 실험/추가 기능 플래그 (코드는 유지) */
export const featureFlags = {
  aiModelFit: false,
  aiClothing: false,
} as const;

export type AiNavItem = { href: string; label: string };

const ALL_AI_NAV_ITEMS: AiNavItem[] = [
  { href: "/matching", label: "AI 매칭" },
  { href: "/ai-model-fit", label: "AI 모델핏" },
  { href: "/ai-clothing", label: "AI 의류 생성" },
];

export function getEnabledAiNavItems(): AiNavItem[] {
  return ALL_AI_NAV_ITEMS.filter((item) => {
    if (item.href === "/ai-model-fit") return featureFlags.aiModelFit;
    if (item.href === "/ai-clothing") return featureFlags.aiClothing;
    return true;
  });
}

export function getEnabledAiMenuPaths(): string[] {
  return getEnabledAiNavItems().map((item) => item.href);
}
