import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검증
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다.' },
        { status: 400 }
      );
    }

    // Puppeteer 브라우저 실행
    // 로컬 개발 환경과 Vercel 프로덕션 환경 구분
    const isProduction = process.env.VERCEL === '1';
    const executablePath = isProduction 
      ? await chromium.executablePath() 
      : process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    const browser = await puppeteer.launch({
      args: isProduction ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: isProduction ? chromium.defaultViewport : { width: 1920, height: 1080 },
      executablePath: executablePath || undefined,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      
      // 페이지 로드 (타임아웃 30초)
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 추가 대기 (동적 콘텐츠 로딩을 위해)
      // waitForTimeout이 제거되었으므로 Promise와 setTimeout 사용
      await new Promise(resolve => setTimeout(resolve, 2000));

      // PDF 생성 (가로 방향)
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true, // 가로 방향
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      await browser.close();

      // PDF를 Base64로 인코딩하여 반환
      const base64Pdf = Buffer.from(pdf).toString('base64');

      return NextResponse.json({
        success: true,
        pdf: base64Pdf,
        mimeType: 'application/pdf',
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error: any) {
    console.error('PDF 변환 오류:', error);
    return NextResponse.json(
      {
        error: 'PDF 변환 중 오류가 발생했습니다.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

