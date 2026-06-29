/** DB에 없을 때 자동 등록되는 기본 팝업 (slug 기준 upsert) */
export type PopupSeed = {
  slug: string;
  title: string;
  content?: string | null;
  image_url: string;
  link_url?: string | null;
  link_url_mobile?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  sort_order?: number;
};

export const POPUP_SEEDS: PopupSeed[] = [
  {
    slug: "faddit-creator-crew-contest",
    title: "FADDIT CREATOR CREW 1기",
    image_url: "/popups/faddit-creator-crew-contest.png",
    link_url: "https://open.kakao.com/o/pXWBTRri",
    start_at: "2026-06-22",
    end_at: "2026-07-10",
    sort_order: 0,
  },
  {
    slug: "faddit-promo",
    title: "FADDIT",
    image_url:
      "https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png",
    link_url:
      "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=pc_top_banner",
    link_url_mobile:
      "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=mobile_banner",
    sort_order: 1,
  },
];
