import "server-only";
import { getServiceSupabase } from "./supabaseService";

export type OAuthUser = {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  profileImage?: string;
  signupMethod?: string;
  externalId?: string;
};

const OAUTH_USER_SELECT = "id,email,name,phoneNumber,profileImage,signupMethod,externalId";

export async function getUserByEmail(email: string): Promise<OAuthUser | null> {
  const { data, error } = await getServiceSupabase()
    .from("users")
    .select(OAUTH_USER_SELECT)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error("사용자 정보를 확인하지 못했습니다.");
  return data as OAuthUser | null;
}

export async function getUserByExternalId(externalId: string, signupMethod: "kakao" | "naver"): Promise<OAuthUser | null> {
  const { data, error } = await getServiceSupabase()
    .from("users")
    .select(OAUTH_USER_SELECT)
    .eq("externalId", externalId)
    .eq("signupMethod", signupMethod)
    .maybeSingle();
  if (error) throw new Error("사용자 정보를 확인하지 못했습니다.");
  return data as OAuthUser | null;
}
