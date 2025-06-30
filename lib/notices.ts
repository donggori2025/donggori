export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: "공지" | "일반" | "채용공고";
}

export const notices: Notice[] = [
  {
    id: "1",
    title: "플랫폼 오픈 안내",
    content: "의류 디자이너와 봉제공장을 연결하는 플랫폼이 정식 오픈했습니다! 많은 이용 바랍니다.",
    createdAt: "2024-06-23",
    type: "공지",
  },
  {
    id: "2",
    title: "매칭 서비스 베타 오픈",
    content: "봉제공장 매칭 서비스가 베타로 오픈되었습니다. 피드백 환영합니다.",
    createdAt: "2024-06-24",
    type: "일반",
  },
  {
    id: "3",
    title: "채용공고 안내",
    content: "동대문 봉제공장에서 생산관리 직원을 채용합니다. 많은 지원 바랍니다.",
    createdAt: "2024-06-25",
    type: "채용공고",
  },
]; 