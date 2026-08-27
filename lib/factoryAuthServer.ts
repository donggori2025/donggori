import "server-only";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "./config";

export interface FactoryAuthRecord {
  id: string;
  factoryId: string;
  username: string;
  password: string;
  factoryName: string;
}

function getRealFactoryName(factoryId: string): string {
  const factoryNames: Record<string, string> = {
    "1": "재민상사",
    "2": "동대문봉제공장",
  };
  return factoryNames[factoryId] || `봉제공장${factoryId}`;
}

export async function validateFactoryLogin(
  username: string,
  password: string
): Promise<FactoryAuthRecord | null> {
  const stripInvisibles = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  const rawUser = stripInvisibles(username).trim();
  const rawPass = stripInvisibles(password).trim();
  const input = rawUser.toLowerCase();

  let normalizedUsername = input;
  if (/^\d{1,2}$/.test(input)) {
    normalizedUsername = `factory${input.padStart(2, "0")}`;
  }
  const factoryMatch = input.match(/^factory(\d{1,2})$/);
  if (factoryMatch) {
    normalizedUsername = `factory${factoryMatch[1].padStart(2, "0")}`;
  }

  if (!config.supabase.url || !config.supabase.serviceRoleKey) return null;
  const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("factory_auth")
    .select("id,factory_id,username,password,factory_name")
    .ilike("username", normalizedUsername)
    .maybeSingle();
  if (error || !data) return null;

  const passwordHash = String(data.password || "");
  if (!/^\$2[aby]\$/.test(passwordHash)) {
    console.error("[SECURITY] factory_auth에 평문 비밀번호가 있어 로그인을 차단했습니다.");
    return null;
  }
  if (!(await bcrypt.compare(rawPass, passwordHash))) return null;

  return {
    id: String(data.id),
    factoryId: String(data.factory_id),
    username: String(data.username),
    password: passwordHash,
    factoryName: String(data.factory_name || getRealFactoryName(String(data.factory_id))),
  };
}

export async function getFactoryAuthWithRealName(
  username: string,
  password: string
): Promise<Omit<FactoryAuthRecord, "password"> | null> {
  const factory = await validateFactoryLogin(username, password);
  if (!factory) return null;

  let factoryName = factory.factoryName;
  try {
    if (
      config.supabase.url &&
      config.supabase.serviceRoleKey &&
      config.supabase.url.startsWith("http")
    ) {
      const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { persistSession: false },
      });
      const { data } = await supabase
        .from("donggori")
        .select("company_name, name")
        .eq("id", parseInt(factory.factoryId, 10))
        .maybeSingle();
      factoryName = data?.company_name || data?.name || getRealFactoryName(factory.factoryId);
    }
  } catch {
    factoryName = getRealFactoryName(factory.factoryId);
  }

  const { password: _pw, ...safe } = factory;
  return { ...safe, factoryName };
}
