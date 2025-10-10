// 단일 공장 폴더 이미지를 Vercel Blob에 업로드
// 사용법: bun scripts/upload-one-factory.js "조아스타일"

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// .env.local 로드 (BLOB_READ_WRITE_TOKEN)
try {
  require('dotenv').config({ path: '.env.local' });
} catch {}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('❌ BLOB_READ_WRITE_TOKEN이 .env.local 에 설정되어 있지 않습니다.');
  process.exit(1);
}

async function uploadFactory(factoryName) {
  const base = path.join(__dirname, '../public/동고리_사진데이터');
  // 폴더는 NFC/NFD 둘 다 시도
  const candidates = [
    factoryName,
    factoryName.normalize('NFC'),
    factoryName.normalize('NFD'),
  ];

  let folderPath = null;
  for (const cand of candidates) {
    const p = path.join(base, cand);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      folderPath = p;
      factoryName = cand; // 실제 디렉터리명 사용
      break;
    }
  }

  if (!folderPath) {
    console.error(`❌ 로컬 폴더가 없습니다: ${path.join(base, factoryName)}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
  if (files.length === 0) {
    console.error('⚠️ 업로드할 이미지가 없습니다.');
    process.exit(0);
  }

  console.log(`🚀 업로드 시작: ${factoryName} (${files.length}개)`);
  let ok = 0;
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    try {
      const buf = fs.readFileSync(filePath);
      const { url } = await put(`${factoryName}/${file}`, buf, { access: 'public', allowOverwrite: true });
      console.log(`✅ ${file} -> ${url}`);
      ok++;
      await new Promise(r => setTimeout(r, 80));
    } catch (e) {
      console.error(`❌ 업로드 실패: ${file}`, e?.message);
    }
  }
  console.log(`🎉 완료: ${ok}/${files.length} 업로드`);
}

const target = process.argv[2] || '조아스타일';
uploadFactory(target).catch(err => {
  console.error('업로드 중 오류:', err);
  process.exit(1);
});



