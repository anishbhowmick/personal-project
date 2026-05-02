import { getSessionSecret, parseSessionCookie, verifySessionToken } from "./_auth";

export default function handler(request: Request) {
  try {
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const secret = getSessionSecret();
    const token = parseSessionCookie(request.headers.get("cookie"));
    const authorized = Boolean(secret) && Boolean(token) && verifySessionToken(token, secret);
    return Response.json({ authorized }, { status: 200 });
  } catch {
    return Response.json({ authorized: false }, { status: 500 });
  }
}
