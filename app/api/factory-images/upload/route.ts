import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || 'factories');
    const filename = String(form.get('filename') || `image_${Date.now()}`);
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: '파일이 필요합니다.' }, { status: 400 });
    }
    const key = `${encodeURIComponent(folder)}/${Date.now()}_${encodeURIComponent(filename)}`;
    const { url } = await put(key, file, { access: 'public' });
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '업로드 실패' }, { status: 400 });
  }
}


