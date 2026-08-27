import crypto from "crypto";

const FACTORY_SESSION_SECRET =
  process.env.FACTORY_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FACTORY_SESSION_SECRET 또는 ADMIN_SESSION_SECRET 환경변수가 필요합니다.");
    }
    return crypto.randomBytes(32).toString("hex");
  })();

const FACTORY_SESSION_TTL_MS = 60 * 60 * 24 * 14 * 1000;

export interface FactorySessionPayload {
  factoryId: string;
  factoryName: string;
  username: string;
  issuedAt: number;
}

export function createFactorySessionValue(
  payload: Omit<FactorySessionPayload, "issuedAt">
): string {
  const body: FactorySessionPayload = { ...payload, issuedAt: Date.now() };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", FACTORY_SESSION_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyFactorySessionValue(value: string): FactorySessionPayload | null {
  try {
    const dot = value.indexOf(".");
    if (dot < 1) return null;
    const data = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    const expected = crypto.createHmac("sha256", FACTORY_SESSION_SECRET).update(data).digest("hex");
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as FactorySessionPayload;
    if (!payload.factoryId || Date.now() - payload.issuedAt > FACTORY_SESSION_TTL_MS) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
