export interface MatchRequest {
  id: string;
  designerUserId: string;
  factoryId: string;
  content: string;
  status: "대기" | "수락" | "거절";
  createdAt: string;
}

export const matchRequests: MatchRequest[] = [
  {
    id: "1",
    designerUserId: "designer1",
    factoryId: "1",
    content: "티셔츠 200장 샘플 및 견적 요청드립니다.",
    status: "대기",
    createdAt: "2024-06-24",
  },
  {
    id: "2",
    designerUserId: "designer2",
    factoryId: "2",
    content: "바지 100장 생산 가능 여부 문의합니다.",
    status: "수락",
    createdAt: "2024-06-24",
  },
]; 