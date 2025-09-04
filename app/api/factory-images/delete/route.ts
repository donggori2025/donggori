import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ ok: false, error: 'url이 필요합니다.' }, { status: 400 });
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '삭제 실패' }, { status: 400 });
  }
}


