import type { IncomingMessage, ServerResponse } from "node:http";
import {
  clearSessionCookieHeader,
  constantTimeEqual,
  createSessionToken,
  getAccessPassword,
  getAccessUsername,
  getSessionSecret,
  sessionCookieHeader,
} from "./_auth";

type RequestBody = { username?: string; password?: string };

const readBody = async (request: IncomingMessage): Promise<RequestBody> => {
  const preParsedBody = (request as IncomingMessage & { body?: unknown }).body;
  if (preParsedBody && typeof preParsedBody === "object") {
    return preParsedBody as RequestBody;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as RequestBody;
  } catch {
    return {};
  }
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "POST") {
    response.statusCode = 405;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const username = getAccessUsername();
  const password = getAccessPassword();
  const secret = getSessionSecret();

  if (!username || !password || !secret) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Access credentials are not configured" }));
    return;
  }

  const body = await readBody(request);
  const inputUsername = (body.username ?? "").trim();
  const inputPassword = body.password ?? "";
  const okUsername = constantTimeEqual(inputUsername, username);
  const okPassword = constantTimeEqual(inputPassword, password);

  if (!okUsername || !okPassword) {
    response.statusCode = 401;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ authorized: false }));
    return;
  }

  const token = createSessionToken(secret);

  response.statusCode = 200;
  response.setHeader("Set-Cookie", sessionCookieHeader(token));
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ authorized: true }));
}
