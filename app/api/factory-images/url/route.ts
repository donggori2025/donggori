import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    console.log('Factory images API 호출됨:', req.url);
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder');
    const file = url.searchParams.get('file');
    console.log('폴더:', folder, '파일:', file);
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

    // 2. Vercel Blob에서 찾지 못하면 정적 경로로 리다이렉트 (파일시스템 직접 접근 회피)
    //    정적 경로: /동고리_사진데이터/{folder}/{file}
    const encodedFolder = encodeURIComponent(decodedFolder);
    const encodedFile = encodeURIComponent(decodedFile);
    const publicUrl = new URL(`/동고리_사진데이터/${encodedFolder}/${encodedFile}`, req.url);
    console.log('Blob 미탐색 → 정적 경로로 리다이렉트:', publicUrl.toString());
    return NextResponse.redirect(publicUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 });
  }
}


