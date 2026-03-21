import { getSessionBroker } from "../../../server/session-broker-store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createJsonResponse(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init.headers
    }
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const profile = body?.profile ?? {};

  const session = getSessionBroker().createSession(profile);

  return createJsonResponse(session);
}
