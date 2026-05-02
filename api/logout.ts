import type { IncomingMessage, ServerResponse } from "node:http";
import { clearSessionCookieHeader } from "./_auth";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    if (request.method !== "POST") {
      response.statusCode = 405;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    response.statusCode = 200;
    response.setHeader("Set-Cookie", clearSessionCookieHeader);
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ authorized: false }));
  } catch {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ authorized: false }));
  }
}
