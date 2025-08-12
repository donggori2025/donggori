const https = require('https');

// 이미지 URL 접근 가능성 확인 함수
function checkImageUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`   📊 상태 코드: ${res.statusCode}`);
      console.log(`   📏 콘텐츠 길이: ${res.headers['content-length'] || '알 수 없음'}`);
      console.log(`   🖼️  콘텐츠 타입: ${res.headers['content-type'] || '알 수 없음'}`);
      
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ 오류: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log(`   ⏰ 타임아웃 (10초)`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkImageUrls() {
  console.log('🔍 업로드된 Vercel Blob 이미지 URL 접근 가능성 확인...\n');

  const testImages = [
    {
      factory: '우정패션',
      url: 'https://m7fjtbfe2aen7kcw.public.blob.vercel-storage.com/%EC%9A%B0%EC%A0%95%ED%8C%A8%EC%85%98/20250714_111200.jpg'
    },
    {
      factory: '우진모피',
      url: 'https://m7fjtbfe2aen7kcw.public.blob.vercel-storage.com/%EC%9A%B0%EC%A7%84%EB%AA%A8%ED%94%BC/20250715_103650.jpg'
    }
  ];

  for (const image of testImages) {
    console.log(`\n--- ${image.factory} 이미지 확인 ---`);
    console.log(`🔗 URL: ${image.url}`);
    
    const isAccessible = await checkImageUrl(image.url);
    
    if (isAccessible) {
      console.log(`   ✅ 이미지 접근 가능`);
    } else {
      console.log(`   ❌ 이미지 접근 불가`);
    }
  }

  console.log('\n✅ 확인 완료');
}

// 스크립트 실행
checkImageUrls()
  .then(() => {
    console.log('\n✅ 모든 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 확인 실패:', error);
    process.exit(1);
  });
