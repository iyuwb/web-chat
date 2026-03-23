import { createJsonResponse } from "../../../lib/api-response.js";
import { getSessionBroker } from "../../../server/session-broker-store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function encodeEvent(payload) {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
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

  const broker = getSessionBroker();

  try {
    broker.getSession(sessionId);
  } catch (error) {
    return createJsonResponse(
      { ok: false, message: error?.message ?? "Session not found." },
      { status: 404 },
    );
  }

  let unsubscribe = null;
  let heartbeat = null;

  const stream = new ReadableStream({
    start(controller) {
      const close = () => {
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }

        unsubscribe?.();
        unsubscribe = null;

        try {
          controller.close();
        } catch {
          // Stream might already be closed.
        }
      };

      const send = (payload) => {
        controller.enqueue(encodeEvent(payload));
      };

      send({ type: "session-ready" });
      unsubscribe = broker.subscribe(sessionId, send);

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", close, { once: true });
    },

    cancel() {
      if (heartbeat) {
        clearInterval(heartbeat);
      }

      unsubscribe?.();
      unsubscribe = null;
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
