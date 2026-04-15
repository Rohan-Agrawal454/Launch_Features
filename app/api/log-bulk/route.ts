import { NextRequest, NextResponse } from "next/server";

/** Node runtime: real stdout lines; one request can still batch—use `/log-bulk-requests` for N HTTP calls. */
export const runtime = "nodejs";

const LOREM_BASE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";

function buildLoremIpsum(length: number): string {
  if (length <= 0) return "";
  const repeats = Math.ceil(length / LOREM_BASE.length);
  return LOREM_BASE.repeat(repeats).slice(0, length);
}

function parsePositiveInt(param: string | null, defaultValue: number): number {
  const n = parseInt(param ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

function writeStdoutLine(line: string): Promise<void> {
  return new Promise((resolve, reject) => {
    process.stdout.write(line + "\n", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function markersForIndex(i: number) {
  return {
    start: `log-starter-count${i} `,
    end: ` log-end-count${i}`,
  };
}

/**
 * GET /api/log-bulk?count=<n>&sizeKb=<k>&startIndex=<s>
 * Emits `count` stdout lines. Index in markers runs from `startIndex` … `startIndex + count - 1`.
 * For **one log per HTTP request** (better for Kafka), call with `count=1` and vary `startIndex`,
 * or use the UI at `/log-bulk-requests`.
 * Defaults: count=1, sizeKb=1, startIndex=1
 */
export async function GET(request: NextRequest) {
  const count = parsePositiveInt(
    request.nextUrl.searchParams.get("count"),
    1
  );
  const sizeKb = parsePositiveInt(
    request.nextUrl.searchParams.get("sizeKb"),
    1
  );
  const startIndex = parsePositiveInt(
    request.nextUrl.searchParams.get("startIndex"),
    1
  );

  const targetBytes = sizeKb * 1024;
  let totalCharsLogged = 0;

  for (let j = 0; j < count; j++) {
    const i = startIndex + j;
    const { start, end } = markersForIndex(i);
    const overhead = start.length + end.length;
    const loremLen = Math.max(0, targetBytes - overhead);
    let line = `${start}${buildLoremIpsum(loremLen)}${end}`;
    if (line.length > targetBytes) {
      line = line.slice(0, targetBytes);
    }
    await writeStdoutLine(line);
    totalCharsLogged += line.length + 1;
  }

  const { start: firstStart, end: firstEnd } = markersForIndex(startIndex);
  const firstOverhead = firstStart.length + firstEnd.length;
  const firstLorem = Math.max(0, targetBytes - firstOverhead);
  const firstLine = `${firstStart}${buildLoremIpsum(firstLorem)}${firstEnd}`;
  const firstPreview =
    firstLine.slice(0, 200) + (firstLine.length > 200 ? "…" : "");

  const lastIndex = startIndex + count - 1;
  const { start: lastStart, end: lastEnd } = markersForIndex(lastIndex);
  const lastOverhead = lastStart.length + lastEnd.length;
  const lastLorem = Math.max(0, targetBytes - lastOverhead);
  const lastLine = `${lastStart}${buildLoremIpsum(lastLorem)}${lastEnd}`;
  const lastPreview =
    lastLine.slice(0, 200) + (lastLine.length > 200 ? "…" : "");

  return NextResponse.json({
    count,
    startIndex,
    lastIndex,
    sizeKb,
    targetBytesPerLog: targetBytes,
    totalLogsEmitted: count,
    approxStdoutBytes: totalCharsLogged,
    markerPattern: "log-starter-count{n} … log-end-count{n}",
    previewFirstLog: firstPreview,
    previewLastLog: count > 1 ? lastPreview : undefined,
    hint:
      "For one Kafka record per log, open /log-bulk-requests or call this URL once per index with count=1.",
  });
}
