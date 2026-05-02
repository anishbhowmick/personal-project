import { clearSessionCookieHeader } from "./_auth";

export default function handler(request: Request) {
  try {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    return new Response(JSON.stringify({ authorized: false }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookieHeader,
      },
    });
  } catch {
    return Response.json({ authorized: false }, { status: 500 });
  }
}
