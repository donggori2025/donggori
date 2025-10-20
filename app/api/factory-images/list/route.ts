import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    console.log('Factory images list API 호출됨:', req.url);
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder');
    
    console.log('받은 folder 파라미터:', folder);
    
    if (!folder) {
      console.log('folder 파라미터가 없음');
      return NextResponse.json({ ok: false, error: 'folder 필요' }, { status: 400 });
    }

    const decodedFolder = decodeURIComponent(folder);
    console.log('디코딩된 folder:', decodedFolder);
    
    // 간단한 테스트 응답
    return NextResponse.json({ 
      ok: true, 
      images: ['/logo_donggori.png'],
      count: 1,
      message: `폴더: ${decodedFolder}`
    });
    
  } catch (e: any) {
    console.error('Factory images list API 오류:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 });
  }
}
