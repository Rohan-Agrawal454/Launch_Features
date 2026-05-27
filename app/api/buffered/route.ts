import { NextRequest, NextResponse } from "next/server";

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
 * GET /api/buffered?count=<n>&intervalMs=<ms>
 * Returns a normal buffered JSON response after waiting.
 */
export async function GET(request: NextRequest) {
  const count = parsePositiveInt(request.nextUrl.searchParams.get("count"), 20);
  const intervalMs = Math.max(
    50,
    parsePositiveInt(request.nextUrl.searchParams.get("intervalMs"), 250)
  );

  const messages: { index: number; time: string }[] = [];
  try {
    for (let i = 0; i < count; i++) {
      await sleep(intervalMs, request.signal);
      messages.push({ index: i, time: new Date().toISOString() });
    }
  } catch (e) {
    if (e instanceof Error && e.message === "aborted") {
      return NextResponse.json({ ok: false, aborted: true, messages });
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, count, intervalMs, messages });
}

