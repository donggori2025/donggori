import type { PopupItem } from "@/lib/types";

export const FADDIT_PROMO_LINKS = {
  pc: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=pc_top_banner",
  mobile: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=mobile_banner",
} as const;

export const FADDIT_PROMO_POPUP: PopupItem = {
  id: "faddit-promo",
  image_url: "https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png",
};

export const FADDIT_CREATOR_CREW_LINKS = {
  pc: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=creator_crew_202606&utm_content=pc_popup",
  mobile: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=creator_crew_202606&utm_content=mobile_popup",
} as const;

export const FADDIT_CREATOR_CREW_POPUP: PopupItem = {
  id: "faddit-creator-crew-contest",
  title: "FADDIT CREATOR CREW 1기",
  image_url: "/popups/faddit-creator-crew-contest.png",
  start_at: "2026-06-22T00:00:00+09:00",
  end_at: "2026-07-10T17:00:00+09:00",
};

export const STATIC_PROMO_POPUPS: PopupItem[] = [
  FADDIT_CREATOR_CREW_POPUP,
  FADDIT_PROMO_POPUP,
];

function isPopupActive(popup: PopupItem, now = new Date()): boolean {
  if (popup.start_at && now < new Date(popup.start_at)) return false;
  if (popup.end_at && now > new Date(popup.end_at)) return false;
  return true;
}

export function getActiveStaticPromoPopups(now = new Date()): PopupItem[] {
  return STATIC_PROMO_POPUPS.filter((popup) => isPopupActive(popup, now));
}

export function getPromoLinkUrl(popupId: string, isMobile: boolean): string | undefined {
  if (popupId === FADDIT_PROMO_POPUP.id) {
    return isMobile ? FADDIT_PROMO_LINKS.mobile : FADDIT_PROMO_LINKS.pc;
  }
  if (popupId === FADDIT_CREATOR_CREW_POPUP.id) {
    return isMobile ? FADDIT_CREATOR_CREW_LINKS.mobile : FADDIT_CREATOR_CREW_LINKS.pc;
  }
  return undefined;
}
