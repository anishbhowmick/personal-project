import type { IncomingMessage, ServerResponse } from "node:http";
import { getSessionSecret, parseSessionCookie, verifySessionToken } from "./_auth";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    if (request.method !== "GET") {
      response.statusCode = 405;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const secret = getSessionSecret();
    const token = parseSessionCookie(request);
    const authorized = Boolean(secret) && Boolean(token) && verifySessionToken(token, secret);

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ authorized }));
  } catch {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ authorized: false }));
  }
}
