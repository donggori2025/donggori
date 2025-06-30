export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const notices: Notice[] = [
  {
    id: "1",
    title: "플랫폼 오픈 안내",
    content: "의류 디자이너와 봉제공장을 연결하는 플랫폼이 정식 오픈했습니다! 많은 이용 바랍니다.",
    createdAt: "2024-06-23",
  },
  {
    id: "2",
    title: "매칭 서비스 베타 오픈",
    content: "봉제공장 매칭 서비스가 베타로 오픈되었습니다. 피드백 환영합니다.",
    createdAt: "2024-06-24",
  },
]; 