import { NextResponse } from "next/server";
import { getRequestAuth } from "@/lib/authHelpers";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function GET() {
  const auth = await getRequestAuth();

  if (!auth.authenticated) {
    return NextResponse.json({ authenticated: false });
  }

  if (auth.role === "admin" || !auth.userId) {
    return NextResponse.json({ authenticated: true, role: auth.role });
  }

  const { data: user, error } = await getServiceSupabase()
    .from("users")
    .select("id,email,name,phoneNumber,profileImage,signupMethod")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, role: "user", user });
}
