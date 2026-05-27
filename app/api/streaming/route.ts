import { NextRequest } from "next/server";

export const runtime = "nodejs";

function parsePositiveInt(param: string | null, defaultValue: number): number {
  const n = parseInt(param ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(new Error("aborted"));
    };
    if (signal.aborted) return onAbort();
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * GET /api/streaming?count=<n>&intervalMs=<ms>
 * Streams Server-Sent Events (SSE).
 */
export async function GET(request: NextRequest) {
  const count = parsePositiveInt(request.nextUrl.searchParams.get("count"), 20);
  const intervalMs = Math.max(
    50,
    parsePositiveInt(request.nextUrl.searchParams.get("intervalMs"), 250)
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("open", { ok: true });

      try {
        for (let i = 0; i < count; i++) {
          await sleep(intervalMs, request.signal);
          send("message", { index: i, time: new Date().toISOString() });
        }
        send("done", { done: true });
      } catch (e) {
        // Client disconnected or aborted; just stop streaming quietly.
        if (!(e instanceof Error && e.message === "aborted")) {
          send("error", { error: e instanceof Error ? e.message : String(e) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

