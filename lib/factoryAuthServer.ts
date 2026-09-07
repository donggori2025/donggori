import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

export interface FactoryAuthRecord {
  id: string;
  factoryId: string;
  username: string;
  password: string;
  factoryName: string;
}

const factoryAuthData: FactoryAuthRecord[] = [];

for (let i = 1; i <= 70; i++) {
  const factoryNumber = i.toString().padStart(2, "0");
  factoryAuthData.push({
    id: i.toString(),
    factoryId: i.toString(),
    username: `factory${factoryNumber}`,
    password: `factory${factoryNumber}!`,
    factoryName: `봉제공장${factoryNumber}`,
  });
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

  const record = factoryAuthData.find((auth) => auth.username.toLowerCase() === normalizedUsername);
  if (!record) return null;

  const bcrypt = await import("bcryptjs");
  if (record.password.startsWith("$2a$") || record.password.startsWith("$2b$")) {
    const valid = await bcrypt.compare(rawPass, record.password);
    if (!valid) return null;
  } else if (record.password !== rawPass) {
    return null;
  }

  return record;
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
