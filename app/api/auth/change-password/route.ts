import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호와 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // Clerk를 통해 현재 비밀번호 확인 및 새 비밀번호로 업데이트
    try {
      // 1. 현재 비밀번호 확인을 위해 로그인 시도
      const verifyResponse = await fetch('https://api.clerk.com/v1/sessions/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        return NextResponse.json(
          { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
          { status: 400 }
        );
      }

      // 2. 새 비밀번호로 업데이트
      const updateResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Clerk 비밀번호 업데이트 오류:', errorData);
        return NextResponse.json(
          { success: false, error: "비밀번호 업데이트에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다."
      });

    } catch (clerkError) {
      console.error('Clerk API 호출 오류:', clerkError);
      return NextResponse.json(
        { success: false, error: "비밀번호 변경 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
