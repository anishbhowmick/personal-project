import type { IncomingMessage, ServerResponse } from "node:http";
import {
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

  return await new Promise<RequestBody>((resolve) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    request.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as RequestBody);
      } catch {
        resolve({});
      }
    });
    request.on("error", () => resolve({}));
  });
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
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
    const inputUsername = typeof body.username === "string" ? body.username.trim() : "";
    const inputPassword = typeof body.password === "string" ? body.password : "";
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
  } catch {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Login handler failed" }));
  }
}
