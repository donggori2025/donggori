import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { generateRandomName } from '@/lib/randomNameGenerator';

export async function POST(request: NextRequest) {
  try {
    const { email, name, picture, googleId } = await request.json();

    // 입력값 검증
    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 이름이 없거나 비어있는 경우 랜덤 이름 생성
    let userName = name;
    if (!userName || userName.trim() === '') {
      userName = generateRandomName();
      console.log('OAuth 사용자 이름이 없어 랜덤 이름 생성:', userName);
    }

    try {
      // Clerk에서 사용자 생성
      const user = await clerkClient.users.createUser({
        emailAddress: [email],
        firstName: userName,
        lastName: '',
        imageUrl: picture || undefined,
        publicMetadata: {
          googleId: googleId || null,
          isOAuthUser: true,
          signupMethod: 'google',
        },
      });

      console.log('Clerk 사용자 생성 성공:', user.id);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: userName,
          picture: user.imageUrl,
          isRandomName: !name || name.trim() === '',
        },
        message: 'OAuth 회원가입이 완료되었습니다.',
      });

    } catch (clerkError: any) {
      console.error('Clerk 사용자 생성 오류:', clerkError);
      
      // 이미 존재하는 사용자인 경우
      if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
        return NextResponse.json(
          { 
            error: '이미 가입된 이메일입니다.',
            code: 'USER_EXISTS'
          },
          { status: 409 }
        );
      }

      // 기타 Clerk 오류
      return NextResponse.json(
        { 
          error: 'Clerk 사용자 생성 중 오류가 발생했습니다.',
          details: clerkError.message || '알 수 없는 오류'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('OAuth 회원가입 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
