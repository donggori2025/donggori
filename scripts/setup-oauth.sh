#!/bin/bash

# OAuth 설정을 위한 환경 변수 설정 스크립트
# 이 스크립트를 실행하기 전에 .env 파일이 존재하는지 확인하세요.

echo "🚀 OAuth 설정을 위한 환경 변수 설정을 시작합니다..."

# .env 파일 존재 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 존재하지 않습니다. env.example을 복사하여 .env 파일을 생성하세요."
    echo "cp env.example .env"
    exit 1
fi

echo "📝 OAuth 설정을 위한 환경 변수를 입력하세요..."

# 네이버 OAuth 설정
echo ""
echo "=== 네이버 OAuth 설정 ==="
read -p "네이버 클라이언트 ID (NEXT_PUBLIC_NAVER_CLIENT_ID): " NAVER_CLIENT_ID
read -p "네이버 클라이언트 시크릿 (NAVER_CLIENT_SECRET): " NAVER_CLIENT_SECRET

# 카카오 OAuth 설정
echo ""
echo "=== 카카오 OAuth 설정 ==="
read -p "카카오 클라이언트 ID (NEXT_PUBLIC_KAKAO_CLIENT_ID): " KAKAO_CLIENT_ID
read -p "카카오 클라이언트 시크릿 (KAKAO_CLIENT_SECRET): " KAKAO_CLIENT_SECRET

# 구글 OAuth 설정
echo ""
echo "=== 구글 OAuth 설정 ==="
read -p "구글 클라이언트 ID (GOOGLE_CLIENT_ID): " GOOGLE_CLIENT_ID
read -p "구글 클라이언트 시크릿 (GOOGLE_CLIENT_SECRET): " GOOGLE_CLIENT_SECRET

# 환경 변수 업데이트
echo ""
echo "🔄 .env 파일을 업데이트하고 있습니다..."

# 네이버 설정 업데이트
if [ ! -z "$NAVER_CLIENT_ID" ]; then
    sed -i.bak "s/NEXT_PUBLIC_NAVER_CLIENT_ID=.*/NEXT_PUBLIC_NAVER_CLIENT_ID=$NAVER_CLIENT_ID/" .env
    echo "✅ 네이버 클라이언트 ID 설정 완료"
fi

if [ ! -z "$NAVER_CLIENT_SECRET" ]; then
    sed -i.bak "s/NAVER_CLIENT_SECRET=.*/NAVER_CLIENT_SECRET=$NAVER_CLIENT_SECRET/" .env
    echo "✅ 네이버 클라이언트 시크릿 설정 완료"
fi

# 카카오 설정 업데이트
if [ ! -z "$KAKAO_CLIENT_ID" ]; then
    sed -i.bak "s/NEXT_PUBLIC_KAKAO_CLIENT_ID=.*/NEXT_PUBLIC_KAKAO_CLIENT_ID=$KAKAO_CLIENT_ID/" .env
    echo "✅ 카카오 클라이언트 ID 설정 완료"
fi

if [ ! -z "$KAKAO_CLIENT_SECRET" ]; then
    sed -i.bak "s/KAKAO_CLIENT_SECRET=.*/KAKAO_CLIENT_SECRET=$KAKAO_CLIENT_SECRET/" .env
    echo "✅ 카카오 클라이언트 시크릿 설정 완료"
fi

# 구글 설정 업데이트
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    sed -i.bak "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID/" .env
    echo "✅ 구글 클라이언트 ID 설정 완료"
fi

if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
    sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET/" .env
    echo "✅ 구글 클라이언트 시크릿 설정 완료"
fi

# 백업 파일 정리
rm -f .env.bak

echo ""
echo "🎉 OAuth 환경 변수 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계를 진행하세요:"
echo "1. 서버를 재시작하세요 (bun dev)"
echo "2. OAuth 제공자에서 리다이렉트 URI를 설정하세요:"
echo "   - 네이버: http://localhost:3000/api/auth/naver/callback"
echo "   - 카카오: http://localhost:3000/api/auth/kakao/callback"
echo "   - 구글: https://donggori.clerk.accounts.dev/v1/oauth_callback"
echo ""
echo "🔍 문제가 발생하면 브라우저 개발자 도구의 콘솔을 확인하세요."
