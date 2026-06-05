import type { PopupItem } from "@/lib/types";

export const FADDIT_PROMO_LINKS = {
  pc: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=pc_top_banner",
  mobile: "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=mobile_banner",
} as const;

export const FADDIT_PROMO_POPUP: PopupItem = {
  id: "faddit-promo",
  image_url: "https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png",
};

export const STATIC_PROMO_POPUPS: PopupItem[] = [FADDIT_PROMO_POPUP];

export function getPromoLinkUrl(popupId: string, isMobile: boolean): string | undefined {
  if (popupId === FADDIT_PROMO_POPUP.id) {
    return isMobile ? FADDIT_PROMO_LINKS.mobile : FADDIT_PROMO_LINKS.pc;
  }
  return undefined;
}
