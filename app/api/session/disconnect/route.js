import { createJsonResponse } from "../../../../lib/api-response.js";
import { getSessionBroker } from "../../../../server/session-broker-store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sessionId = `${body?.sessionId ?? ""}`.trim();

  if (!sessionId) {
    return createJsonResponse(
      { ok: false, message: "sessionId is required." },
      { status: 400 },
    );
  }

  getSessionBroker().disconnectSession(sessionId);

  return createJsonResponse({ ok: true });
}
