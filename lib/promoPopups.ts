import type { PopupItem } from "@/lib/types";

export const FADDIT_PROMO_POPUP: PopupItem & { link_url: string } = {
  id: "faddit-promo",
  image_url: "https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png",
  link_url: "https://faddit.co.kr",
};

export const STATIC_PROMO_POPUPS: Array<PopupItem & { link_url?: string }> = [
  FADDIT_PROMO_POPUP,
];
