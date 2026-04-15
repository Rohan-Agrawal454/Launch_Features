import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function parsePositiveInt(param: string | null, defaultValue: number): number {
  const n = parseInt(param ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

/**
 * GET /api/log-bulk-requests?count=<n>&sizeKb=<k>
 * Triggers `count` sequential HTTP calls to /api/log-bulk (count=1 each), so each log is its own request.
 * Same idea as the page at /log-bulk-requests, but callable from curl or the browser address bar.
 */
export async function GET(request: NextRequest) {
  const totalLogs = parsePositiveInt(
    request.nextUrl.searchParams.get("count"),
    1
  );
  const sizeKb = parsePositiveInt(
    request.nextUrl.searchParams.get("sizeKb"),
    1
  );

  const origin = request.nextUrl.origin;
  const results: { index: number; status: number }[] = [];

  for (let i = 1; i <= totalLogs; i++) {
    const url = new URL("/api/log-bulk", origin);
    url.searchParams.set("count", "1");
    url.searchParams.set("sizeKb", String(sizeKb));
    url.searchParams.set("startIndex", String(i));

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "x-internal-trigger": "log-bulk-requests" },
    });

    results.push({ index: i, status: res.status });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Request failed at index ${i}`,
          status: res.status,
          results,
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    count: totalLogs,
    sizeKb,
    message: `Triggered ${totalLogs} sequential GETs to /api/log-bulk (count=1 per call).`,
    results,
  });
}
