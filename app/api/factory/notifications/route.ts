import { NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import {
  listFactoryNotificationRecords,
  markFactoryNotificationRecordsRead,
} from "@/lib/workOrderRepository";

export async function GET(req: Request) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId") || auth.userId;
  if (!factoryId) {
    return NextResponse.json({ success: false, error: "factoryId가 필요합니다." }, { status: 400 });
  }
  if (auth.role === "factory" && auth.userId !== factoryId) {
    return unauthorized();
  }

  try {
    const { data, mock } = await listFactoryNotificationRecords(factoryId);
    return NextResponse.json({ success: true, data, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알림 조회에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await getRequestAuth();
  if (!auth.authenticated) return unauthorized();

  const body = await req.json();
  const factoryId = body.factoryId || auth.userId;
  if (!factoryId) {
    return NextResponse.json({ success: false, error: "factoryId가 필요합니다." }, { status: 400 });
  }
  if (auth.role === "factory" && auth.userId !== factoryId) {
    return unauthorized();
  }

  try {
    const { mock } = await markFactoryNotificationRecordsRead(
      factoryId,
      Array.isArray(body.ids) ? body.ids : undefined
    );
    return NextResponse.json({ success: true, mock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알림 읽음 처리에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
