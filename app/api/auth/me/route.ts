import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/authHelpers";

export async function GET() {
  const auth = await getRequestAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
  });
}
