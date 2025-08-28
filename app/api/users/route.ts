import { NextResponse } from 'next/server';
import { upsertUser, getUserByEmail, getUserByExternalId, updateUser, deleteUser } from '@/lib/userService';

// 사용자 생성 또는 업데이트
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { email, name, phone, profileImage, loginMethod, externalId, kakaoMessageConsent } = body;
    
    if (!email || !name || !loginMethod) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다: email, name, loginMethod' },
        { status: 400 }
      );
    }

    const user = await upsertUser({
      email,
      name,
      phone,
      profileImage,
      loginMethod,
      externalId,
      kakaoMessageConsent
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자 생성/업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('사용자 생성/업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

// 사용자 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const externalId = searchParams.get('externalId');
    const loginMethod = searchParams.get('loginMethod');

    if (!email && (!externalId || !loginMethod)) {
      return NextResponse.json(
        { success: false, error: '조회 조건이 필요합니다: email 또는 externalId+loginMethod' },
        { status: 400 }
      );
    }

    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else if (externalId && loginMethod) {
      user = await getUserByExternalId(externalId, loginMethod);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('사용자 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

// 사용자 정보 업데이트
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: '사용자 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('사용자 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

// 사용자 삭제
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    const success = await deleteUser(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '사용자 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('사용자 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
