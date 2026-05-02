import { createHmac, timingSafeEqual } from "node:crypto";

type RequestLike = {
  headers: {
    cookie?: string;
  };
};

const SESSION_COOKIE = "__Host-dashboard_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const base64UrlEncode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const getSessionSecret = () => process.env.SESSION_SECRET ?? "";
export const getAccessUsername = () => process.env.ACCESS_USERNAME ?? "";
export const getAccessPassword = () => process.env.ACCESS_PASSWORD ?? "";

export const constantTimeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createSessionToken = (secret: string) => {
  const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  const encoded = base64UrlEncode(payload);
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
};

export const verifySessionToken = (token: string, secret: string) => {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded, secret);
  if (!constantTimeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as { exp?: number };
    if (!payload.exp) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const parseSessionCookie = (request: RequestLike) => {
  const raw = request.headers.cookie ?? "";
  const match = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!match) return "";
  return decodeURIComponent(match.split("=").slice(1).join("="));
};

export const sessionCookieHeader = (token: string) =>
  `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;

export const clearSessionCookieHeader =
  `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
