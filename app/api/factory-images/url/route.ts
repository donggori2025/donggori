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

    // 2. Vercel Blob에서 찾지 못하면 파일시스템에서 직접 서빙 (한글 NFC/NFD 모두 시도)
    const baseNameNFC = '동고리_사진데이터';
    const baseNameNFD = baseNameNFC.normalize('NFD');
    const baseCandidates = Array.from(new Set([baseNameNFC, baseNameNFD]));

    for (const baseName of baseCandidates) {
      const publicPath = path.join(process.cwd(), 'public', baseName, decodedFolder, decodedFile);
      const exists = fs.existsSync(publicPath);
      console.log(`[FS 체크] ${publicPath} exists=${exists}`);
      if (exists) {
        const fileBuffer = fs.readFileSync(publicPath);
        const contentType = decodedFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 3. 그래도 못 찾으면 public 아래에서 실제 디렉터리명 탐색 후 해당 이름으로 리다이렉트
    const publicRoot = path.join(process.cwd(), 'public');
    let actualDirName: string | null = null;
    try {
      const entries = fs.readdirSync(publicRoot, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const n = e.name;
        if (
          n === baseNameNFC ||
          n === baseNameNFD ||
          n.normalize('NFC') === baseNameNFC ||
          n.normalize('NFD') === baseNameNFD
        ) {
          actualDirName = n;
          break;
        }
      }
    } catch (scanErr) {
      console.log('public 디렉터리 스캔 실패:', scanErr);
    }

    const encodedFolder = encodeURIComponent(decodedFolder);
    const encodedFile = encodeURIComponent(decodedFile);
    const baseForRedirect = actualDirName ?? baseNameNFC;
    const publicUrl = new URL(`/${baseForRedirect}/${encodedFolder}/${encodedFile}`, req.url);
    console.log('FS 미탐색 → 실제 디렉터리명으로 리다이렉트:', { baseForRedirect, url: publicUrl.toString() });
    return NextResponse.redirect(publicUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 });
  }
}


