import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder');
    const file = url.searchParams.get('file');
    if (!folder || !file) return NextResponse.json({ ok: false, error: 'folder, file 필요' }, { status: 400 });

    const decodedFolder = decodeURIComponent(folder);
    const decodedFile = decodeURIComponent(file);
    
    // 1. 먼저 Vercel Blob Storage에서 찾기
    try {
      const { blobs } = await list({ prefix: `${decodedFolder}/` });
      const found = blobs.find(b => {
        try {
          const u = new URL(b.url);
          return decodeURIComponent(u.pathname).endsWith(`/${decodedFolder}/${decodedFile}`);
        } catch {
          return false;
        }
      });

      if (found) {
        return NextResponse.redirect(found.url, 302);
      }
    } catch (blobError) {
      console.log('Vercel Blob에서 찾지 못함, public 폴더에서 시도:', blobError);
    }

    // 2. Vercel Blob에서 찾지 못하면 public 폴더에서 찾기
    const publicPath = path.join(process.cwd(), 'public', '동고리_사진데이터', decodedFolder, decodedFile);
    
    if (fs.existsSync(publicPath)) {
      // public 폴더의 이미지를 직접 서빙
      const fileBuffer = fs.readFileSync(publicPath);
      const contentType = decodedFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 });
  }
}


