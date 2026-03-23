import { createJsonResponse } from "../../../lib/api-response.js";
import { getSessionBroker } from "../../../server/session-broker-store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStatusCode(error) {
  if (error?.code === "CLIENT_NOT_FOUND") {
    return 404;
  }

  return 400;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sessionId = `${body?.sessionId ?? ""}`.trim();
  const action = body?.action;

  if (!sessionId || !action?.type) {
    return createJsonResponse(
      { ok: false, message: "sessionId and action.type are required." },
      { status: 400 },
    );
  }

  try {
    getSessionBroker().dispatchAction(sessionId, action);
    return createJsonResponse({ ok: true });
  } catch (error) {
    return createJsonResponse(
      { ok: false, message: error?.message ?? "Unexpected server error." },
      { status: getStatusCode(error) },
    );
  }
}
