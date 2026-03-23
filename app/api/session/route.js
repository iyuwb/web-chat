import { getSessionBroker } from "../../../server/session-broker-store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createJsonResponse(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = `${searchParams.get("sessionId") ?? ""}`.trim();

  if (!sessionId) {
    return createJsonResponse(
      { ok: false, message: "sessionId is required." },
      { status: 400 },
    );
  }

  try {
    return createJsonResponse(getSessionBroker().restoreSession(sessionId));
  } catch (error) {
    return createJsonResponse(
      { ok: false, message: error?.message ?? "Session not found." },
      { status: 404 },
    );
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const profile = body?.profile ?? {};

  const session = getSessionBroker().createSession(profile);

  return createJsonResponse(session);
}
