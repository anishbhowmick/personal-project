import {
  constantTimeEqual,
  createSessionToken,
  getAccessPassword,
  getAccessUsername,
  getSessionSecret,
  sessionCookieHeader,
} from "./_auth";

type RequestBody = { username?: string; password?: string };

const readBody = async (request: Request): Promise<RequestBody> => {
  try {
    return (await request.json()) as RequestBody;
  } catch {
    return {};
  }
};

export default async function handler(request: Request) {
  try {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const username = getAccessUsername();
    const password = getAccessPassword();
    const secret = getSessionSecret();

    if (!username || !password || !secret) {
      return Response.json({ error: "Access credentials are not configured" }, { status: 500 });
    }

    const body = await readBody(request);
    const inputUsername = typeof body.username === "string" ? body.username.trim() : "";
    const inputPassword = typeof body.password === "string" ? body.password : "";
    const okUsername = constantTimeEqual(inputUsername, username);
    const okPassword = constantTimeEqual(inputPassword, password);

    if (!okUsername || !okPassword) {
      return Response.json({ authorized: false }, { status: 401 });
    }

    const token = createSessionToken(secret);
    return new Response(JSON.stringify({ authorized: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": sessionCookieHeader(token),
      },
    });
  } catch {
    return Response.json({ error: "Login handler failed" }, { status: 500 });
  }
}
