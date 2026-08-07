import type { DeliveryMethod, ProductionType, WorkOrderRecord } from "./workOrderTypes";
import { canRunAction, type WorkOrderAction } from "./workOrderWorkflow";

export type FactoryActionOption = {
  id: string;
  label: string;
  description?: string;
  kind: "workflow" | "message";
  action?: WorkOrderAction;
  payload?: {
    productionType?: ProductionType;
    deliveryMethod?: DeliveryMethod;
    message?: string;
  };
  message?: string;
};

function workflowOption(
  id: string,
  label: string,
  action: WorkOrderAction,
  description?: string,
  payload?: FactoryActionOption["payload"]
): FactoryActionOption | null {
  return { id, label, description, kind: "workflow", action, payload };
}

function messageOption(id: string, label: string, message: string, description?: string): FactoryActionOption {
  return { id, label, description, kind: "message", message };
}

/** 공장 사장님 태블릿 UI — 현재 단계에서 선택 가능한 작업 목록 */
export function getFactoryActionOptions(order: WorkOrderRecord): FactoryActionOption[] {
  const options: Array<FactoryActionOption | null> = [];

  if (canRunAction(order.status, "factory_acknowledge")) {
    options.push(workflowOption("ack", "의뢰 내용 확인했습니다", "factory_acknowledge"));
  }

  if (canRunAction(order.status, "factory_request_review")) {
    options.push(workflowOption("review", "검토 요청 보내기", "factory_request_review"));
    options.push(
      messageOption(
        "review-msg",
        "검토 요청 메시지 보내기",
        "안녕하세요. 작업지시서 검토 부탁드립니다. 확인 후 회신 주시면 감사하겠습니다.",
        "채팅으로만 전송"
      )
    );
  }

  if (canRunAction(order.status, "factory_advance_to_payment")) {
    options.push(
      workflowOption(
        "to-payment",
        "결제 단계로 진행",
        "factory_advance_to_payment",
        "고객 응답 없이 입금 안내"
      )
    );
  }

  if (order.status === "awaiting_user_review") {
    options.push(
      messageOption(
        "review-remind",
        "검토 요청 다시 보내기",
        "검토 요청드립니다. 확인 후 회신 부탁드립니다.",
        "채팅으로만 전송"
      )
    );
  }

  if (canRunAction(order.status, "factory_confirm_order_payment")) {
    options.push(
      workflowOption(
        "confirm-payment",
        "입금 확인 완료",
        "factory_confirm_order_payment",
        "고객 입금 확인 후 작업 유형 선택"
      )
    );
  }

  if (canRunAction(order.status, "factory_choose_production_type")) {
    options.push(
      workflowOption("start-sample", "샘플 작업 시작", "factory_choose_production_type", undefined, {
        productionType: "sample",
      })
    );
    options.push(
      workflowOption("start-production", "본작업 시작", "factory_choose_production_type", undefined, {
        productionType: "production",
      })
    );
  }

  if (canRunAction(order.status, "factory_complete_work")) {
    options.push(workflowOption("complete", "작업 완료", "factory_complete_work"));
  }

  if (canRunAction(order.status, "factory_advance_pickup")) {
    options.push(
      workflowOption(
        "pickup",
        "직접 방문 수령 가능",
        "factory_advance_pickup",
        "고객 수령 방법 선택 없이 진행"
      )
    );
  }

  if (canRunAction(order.status, "factory_advance_quick")) {
    options.push(
      workflowOption(
        "quick",
        "퀵 배송 안내",
        "factory_advance_quick",
        "고객 선택 없이 배송비 안내"
      )
    );
  }

  if (canRunAction(order.status, "factory_confirm_quick_payment")) {
    options.push(
      workflowOption(
        "confirm-quick",
        "배송비 입금 확인",
        "factory_confirm_quick_payment",
        "퀵 배송비 입금 확인"
      )
    );
  }

  if (canRunAction(order.status, "factory_dispatch_quick")) {
    options.push(workflowOption("dispatch", "퀵 발송 완료", "factory_dispatch_quick"));
  }

  if (canRunAction(order.status, "factory_ready_pickup")) {
    options.push(workflowOption("ready-pickup", "방문 수령 가능 안내", "factory_ready_pickup"));
  }

  if (canRunAction(order.status, "factory_confirm_purchase")) {
    options.push(
      workflowOption(
        "finish",
        "거래 완료 처리",
        "factory_confirm_purchase",
        "구매 확정 없이 거래 종료"
      )
    );
  }

  return options.filter((item): item is FactoryActionOption => Boolean(item));
}
