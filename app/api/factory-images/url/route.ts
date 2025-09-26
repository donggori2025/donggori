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
    const publicRoot = path.join(process.cwd(), 'public');

    // 2-1) public 루트에서 실제 base 디렉터리명 찾기 (NFC/NFD 호환)
    let actualBaseDir = baseNameNFC;
    try {
      const rootEntries = fs.readdirSync(publicRoot, { withFileTypes: true });
      const hit = rootEntries.find(e => e.isDirectory() && (
        e.name === baseNameNFC ||
        e.name === baseNameNFD ||
        e.name.normalize('NFC') === baseNameNFC ||
        e.name.normalize('NFD') === baseNameNFD
      ));
      if (hit) actualBaseDir = hit.name;
    } catch (err) {
      console.log('public 루트 스캔 실패:', err);
    }

    // 2-2) 폴더명(NFC/NFD) 매칭
    const baseDirPath = path.join(publicRoot, actualBaseDir);
    let actualFolderName: string | null = null;
    try {
      const folderEntries = fs.readdirSync(baseDirPath, { withFileTypes: true });
      const folderHit = folderEntries.find(e => e.isDirectory() && (
        e.name === decodedFolder ||
        e.name.normalize('NFC') === decodedFolder ||
        e.name.normalize('NFD') === decodedFolder.normalize('NFD')
      ));
      if (folderHit) actualFolderName = folderHit.name;
    } catch (err) {
      console.log('폴더 스캔 실패:', err);
    }

    if (actualFolderName) {
      // 2-3) 파일명(NFC/NFD) 매칭
      const folderPath = path.join(baseDirPath, actualFolderName);
      try {
        // 우선 디렉터리 스캔으로 일치 항목 찾기
        const fileEntries = fs.readdirSync(folderPath, { withFileTypes: true });
        const fileHit = fileEntries.find(e => e.isFile() && (
          e.name === decodedFile ||
          e.name.normalize('NFC') === decodedFile ||
          e.name.normalize('NFD') === decodedFile.normalize('NFD')
        ));

        const candidates: string[] = [];
        if (fileHit) {
          candidates.push(path.join(folderPath, fileHit.name));
        }

        // 스캔에서 못 찾았을 경우를 대비해 모든 조합으로 직접 경로 시도
        const baseCandidates = [actualBaseDir, baseNameNFC, baseNameNFD];
        const folderCandidates = [actualFolderName, decodedFolder, decodedFolder.normalize('NFC'), decodedFolder.normalize('NFD')];
        const fileCandidates = [decodedFile, decodedFile.normalize('NFC'), decodedFile.normalize('NFD')];

        for (const b of baseCandidates) {
          for (const f of folderCandidates) {
            for (const fn of fileCandidates) {
              const p = path.join(publicRoot, b, f, fn);
              if (!candidates.includes(p)) candidates.push(p);
            }
          }
        }

        for (const resolvedPath of candidates) {
          try {
            if (fs.existsSync(resolvedPath)) {
              console.log('서빙 파일 경로:', resolvedPath);
              const fileBuffer = fs.readFileSync(resolvedPath);
              const contentType = resolvedPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
              return new NextResponse(fileBuffer, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=31536000, immutable',
                },
              });
            }
          } catch {}
        }
      } catch (err) {
        console.log('파일 스캔 실패:', err);
      }
    }

    // 2-4) 마지막 폴백: 정적 경로 리다이렉트 (브라우저/서버 조합에 따라 성공 가능)
    const publicUrl = new URL(`/${encodeURIComponent(actualBaseDir)}/${encodeURIComponent(decodedFolder)}/${encodeURIComponent(decodedFile)}` , req.url);
    console.log('모든 매칭 실패 → 정적 경로로 리다이렉트:', publicUrl.toString());
    return NextResponse.redirect(publicUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 400 });
  }
}


