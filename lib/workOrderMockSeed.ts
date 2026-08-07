import { randomUUID } from "crypto";
import type {
  FactoryNotification,
  WorkOrderMessage,
  WorkOrderRecord,
  WorkOrderStatus,
} from "./workOrderTypes";

type SeedState = {
  orders: Map<string, WorkOrderRecord>;
  messages: Map<string, WorkOrderMessage[]>;
  notifications: Map<string, FactoryNotification[]>;
  seeded?: boolean;
};

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function addSeedMessage(
  state: SeedState,
  orderId: string,
  input: {
    sender_role: WorkOrderMessage["sender_role"];
    sender_id?: string | null;
    sender_name?: string | null;
    message: string;
    attachments?: WorkOrderMessage["attachments"];
    include_work_order?: boolean;
    created_at?: string;
  }
) {
  const list = state.messages.get(orderId) || [];
  list.push({
    id: randomUUID(),
    work_order_id: orderId,
    sender_role: input.sender_role,
    sender_id: input.sender_id ?? null,
    sender_name: input.sender_name ?? null,
    message: input.message,
    attachments: input.attachments || [],
    include_work_order: input.include_work_order ?? false,
    created_at: input.created_at || new Date().toISOString(),
    read_at: null,
  });
  state.messages.set(orderId, list);
}

function insertSeedOrder(
  state: SeedState,
  input: {
    id?: string;
    factory_id: string;
    factory_name: string;
    user_id?: string;
    user_email: string;
    user_name: string;
    title: string;
    description: string;
    status: WorkOrderStatus;
    amount?: number;
    work_order_json: Record<string, unknown>;
    created_hours_ago?: number;
    initial_message?: string;
    extra_messages?: Array<{
      sender_role: WorkOrderMessage["sender_role"];
      sender_name?: string;
      message: string;
      hours_ago?: number;
    }>;
  }
) {
  const id = input.id || randomUUID();
  const createdAt = hoursAgo(input.created_hours_ago ?? 1);

  const order: WorkOrderRecord = {
    id,
    match_request_id: null,
    user_id: input.user_id || null,
    user_email: input.user_email,
    user_name: input.user_name,
    factory_id: input.factory_id,
    factory_name: input.factory_name,
    title: input.title,
    description: input.description,
    work_order_json: input.work_order_json,
    amount: input.amount ?? 0,
    status: input.status,
    quick_delivery_fee: Number(process.env.QUICK_DELIVERY_FEE || 15000),
    factory_notified_at: createdAt,
    created_at: createdAt,
    updated_at: createdAt,
  };

  if (input.status !== "work_order_sent") {
    order.factory_read_at = hoursAgo((input.created_hours_ago ?? 1) - 0.5);
  }

  state.orders.set(id, order);

  if (input.initial_message) {
    addSeedMessage(state, id, {
      sender_role: "user",
      sender_id: input.user_id || null,
      sender_name: input.user_name,
      message: input.initial_message,
      include_work_order: true,
      created_at: createdAt,
    });
  }

  addSeedMessage(state, id, {
    sender_role: "system",
    sender_name: "시스템",
    message: "작업지시서가 전달되었습니다. 공장에서 확인 후 채팅으로 협의를 진행합니다.",
    include_work_order: false,
    created_at: createdAt,
  });

  for (const msg of input.extra_messages || []) {
    addSeedMessage(state, id, {
      sender_role: msg.sender_role,
      sender_name: msg.sender_name,
      message: msg.message,
      created_at: hoursAgo(msg.hours_ago ?? 0.5),
    });
  }

  const notifications = state.notifications.get(input.factory_id) || [];
  notifications.unshift({
    id: randomUUID(),
    factory_id: input.factory_id,
    work_order_id: id,
    notification_type: "work_order_arrived",
    title: "새 작업지시서 도착",
    body: `${input.user_name}님의 작업지시서가 도착했습니다.`,
    created_at: createdAt,
    read_at: input.status === "work_order_sent" ? null : createdAt,
  });
  state.notifications.set(input.factory_id, notifications);

  return order;
}

/** 개발용 목업 의뢰 데이터 (factory01 = factory_id "1") */
export function seedDemoWorkOrdersIfEmpty(state: SeedState) {
  if (process.env.WORK_ORDER_SEED_DEMO === "false") return;

  if (state.orders.has("demo-wo-factory1-001")) {
    state.seeded = true;
    return;
  }

  state.seeded = false;
  const factoryId = "1";
  const factoryName = "재민상사";

  insertSeedOrder(state, {
    id: "demo-wo-factory1-001",
    factory_id: factoryId,
    factory_name: factoryName,
    user_id: "dev-user-1",
    user_email: "dev@donggori.local",
    user_name: "김서연",
    title: `${factoryName} 작업지시서`,
    description: "여성 오버핏 자켓 300장, 직기 원단. 샘플 후 본생산 희망합니다.",
    status: "work_order_sent",
    amount: 4500000,
    created_hours_ago: 2,
    work_order_json: {
      요청구분: "의뢰하기",
      브랜드: "서연 스튜디오",
      담당자: "김서연",
      연락처: "010-1234-5678",
      샘플: "미보유",
      패턴: "보유",
      QC: "희망",
      시아게: "희망",
      포장: "희망",
      상세설명: "여성 오버핏 자켓 300장, 직기 원단. 샘플 후 본생산 희망합니다.",
      요청사항: "밴드 마감, 라벨 부착 포함 부탁드립니다.",
      링크: ["www.faddit.co.kr", "https://www.pinterest.com/pin/example"],
      의뢰일: new Date().toLocaleDateString("ko-KR"),
    },
    initial_message: `[미호패션 의뢰 문의]

- 요청 구분: 의뢰하기
- 디자이너: 김서연
- 연락처: 010-1234-5678
- 브랜드: 서연 스튜디오

- 상세 설명:
여성 오버핏 자켓 300장, 직기 원단. 샘플 후 본생산 희망합니다.

- 참고 링크:
1. www.faddit.co.kr
2. https://www.pinterest.com/pin/example

동고리를 통해 문의드립니다. 감사합니다!`,
  });

  insertSeedOrder(state, {
    id: "demo-wo-factory1-002",
    factory_id: factoryId,
    factory_name: factoryName,
    user_email: "hanjaekim99@gmail.com",
    user_name: "이준호",
    title: `${factoryName} 작업지시서`,
    description: "아동복 상하의 세트 샘플 2벌 먼저 제작 후 본생산 논의.",
    status: "in_discussion",
    amount: 1200000,
    created_hours_ago: 24,
    work_order_json: {
      요청구분: "의뢰하기",
      브랜드: "준호 키즈",
      담당자: "이준호",
      연락처: "010-9876-5432",
      샘플: "미보유",
      패턴: "미보유",
      상세설명: "아동복 상하의 세트 샘플 2벌 먼저 제작 후 본생산 논의.",
      링크: ["https://www.instagram.com/example"],
      의뢰일: new Date(Date.now() - 86400000).toLocaleDateString("ko-KR"),
    },
    initial_message: "아동복 샘플 의뢰드립니다. 상의 110, 하의 110 사이즈 각 1벌씩 부탁드려요.",
    extra_messages: [
      {
        sender_role: "factory",
        sender_name: factoryName,
        message: "안녕하세요. 도식 확인했습니다. 원단은 보내주실 예정인가요?",
        hours_ago: 20,
      },
      {
        sender_role: "user",
        sender_name: "이준호",
        message: "네, 내일 택배로 보내드리겠습니다.",
        hours_ago: 18,
      },
    ],
  });

  insertSeedOrder(state, {
    id: "demo-wo-factory1-003",
    factory_id: factoryId,
    factory_name: factoryName,
    user_email: "designer@example.com",
    user_name: "최유진",
    title: `${factoryName} 작업지시서`,
    description: "기능성 원단 운동복 상·하의 세트 500세트.",
    status: "awaiting_order_payment",
    amount: 8900000,
    created_hours_ago: 48,
    work_order_json: {
      요청구분: "의뢰하기",
      브랜드: "유진핏",
      담당자: "최유진",
      연락처: "010-5555-1212",
      상세설명: "기능성 원단 운동복 상·하의 세트 500세트.",
      의뢰일: new Date(Date.now() - 172800000).toLocaleDateString("ko-KR"),
    },
    initial_message: "운동복 본생산 의뢰합니다. 납기 4주 가능할까요?",
  });

  insertSeedOrder(state, {
    id: "demo-wo-factory1-004",
    factory_id: factoryId,
    factory_name: factoryName,
    user_email: "brand@example.com",
    user_name: "박민수",
    title: `${factoryName} 작업지시서`,
    description: "남성 셔츠 200장, 단가 협의 완료.",
    status: "sample_in_progress",
    amount: 3200000,
    created_hours_ago: 72,
    work_order_json: {
      요청구분: "의뢰하기",
      브랜드: "민수클래식",
      담당자: "박민수",
      연락처: "010-3333-4444",
      상세설명: "남성 셔츠 200장, 단가 협의 완료.",
      의뢰일: new Date(Date.now() - 259200000).toLocaleDateString("ko-KR"),
    },
    initial_message: "샘플 작업 진행 부탁드립니다.",
    extra_messages: [
      {
        sender_role: "system",
        sender_name: "시스템",
        message: "작업 대금 입금이 확인되었습니다. 샘플/본작업 유형을 선택해 주세요.",
        hours_ago: 60,
      },
    ],
  });

  // 다른 공장 의뢰 1건 (사용자 목록용)
  insertSeedOrder(state, {
    id: "demo-wo-factory2-001",
    factory_id: "2",
    factory_name: "동대문봉제공장",
    user_id: "dev-user-1",
    user_email: "dev@donggori.local",
    user_name: "개발 테스트 사용자",
    title: "동대문봉제공장 작업지시서",
    description: "원피스 소량 샘플 의뢰",
    status: "work_order_sent",
    amount: 800000,
    created_hours_ago: 5,
    work_order_json: {
      요청구분: "의뢰하기",
      담당자: "개발 테스트 사용자",
      연락처: "01000000000",
      상세설명: "원피스 소량 샘플 의뢰",
      링크: [],
    },
    initial_message: "원피스 샘플 1벌 부탁드립니다.",
  });

  state.seeded = true;
}
