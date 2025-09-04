import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder');
    const file = url.searchParams.get('file');
    if (!folder || !file) return NextResponse.json({ ok: false, error: 'folder, file 필요' }, { status: 400 });

    const decodedFolder = decodeURIComponent(folder);
    const decodedFile = decodeURIComponent(file);
    const { blobs } = await list({ prefix: `${decodedFolder}/` });

    const found = blobs.find(b => {
      try {
        const u = new URL(b.url);
        return decodeURIComponent(u.pathname).endsWith(`/${decodedFolder}/${decodedFile}`);
      } catch {
        return false;
      }
    });

    if (!found) {
      return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    }

    return NextResponse.redirect(found.url, 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 });
  }
}


