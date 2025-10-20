import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    console.log('Factory images list API 호출됨:', req.url);
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder');
    
    if (!folder) {
      return NextResponse.json({ ok: false, error: 'folder 필요' }, { status: 400 });
    }

    const decodedFolder = decodeURIComponent(folder);
    
    // public 폴더에서 실제 파일 목록 가져오기
    const baseNameNFC = '동고리_사진데이터';
    const baseNameNFD = baseNameNFC.normalize('NFD');
    const publicRoot = path.join(process.cwd(), 'public');

    // 1) public 루트에서 실제 base 디렉터리명 찾기 (NFC/NFD 호환)
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
      return NextResponse.json({ ok: false, error: '폴더를 찾을 수 없습니다' }, { status: 404 });
    }

    // 2) 폴더명(NFC/NFD) 매칭
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
      return NextResponse.json({ ok: false, error: '폴더를 찾을 수 없습니다' }, { status: 404 });
    }

    if (!actualFolderName) {
      return NextResponse.json({ ok: false, error: '폴더를 찾을 수 없습니다' }, { status: 404 });
    }

    // 3) 파일 목록 가져오기
    const folderPath = path.join(baseDirPath, actualFolderName);
    try {
      const fileEntries = fs.readdirSync(folderPath, { withFileTypes: true });
      const imageFiles = fileEntries
        .filter(e => e.isFile() && (e.name.toLowerCase().endsWith('.jpg') || e.name.toLowerCase().endsWith('.jpeg') || e.name.toLowerCase().endsWith('.png')))
        .map(e => e.name)
        .sort(); // 파일명으로 정렬

      // 각 파일에 대한 URL 생성
      const imageUrls = imageFiles.map(fileName => 
        `/api/factory-images/url?folder=${encodeURIComponent(actualFolderName)}&file=${encodeURIComponent(fileName)}`
      );

      return NextResponse.json({ 
        ok: true, 
        images: imageUrls,
        count: imageUrls.length 
      });
    } catch (err) {
      console.log('파일 목록 조회 실패:', err);
      return NextResponse.json({ ok: false, error: '파일 목록을 가져올 수 없습니다' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('Factory images list API 오류:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 });
  }
}
