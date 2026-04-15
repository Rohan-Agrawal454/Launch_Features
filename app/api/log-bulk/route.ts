import { NextRequest, NextResponse } from "next/server";

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

/**
 * GET /api/log-bulk?count=<n>&sizeKb=<k>
 * Emits `count` separate console.log lines. Each line is ~`sizeKb` KiB (UTF-8 bytes for ASCII lorem),
 * wrapped with log-starter-count{i} … log-end-count{i}.
 * Defaults: count=1, sizeKb=1
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

  const targetBytes = sizeKb * 1024;
  let totalCharsLogged = 0;

  for (let i = 1; i <= count; i++) {
    const start = ` log-starter-count${i} `;
    const end = ` log-end-count${i} `;
    const overhead = start.length + end.length;
    const loremLen = Math.max(0, targetBytes - overhead);
    let line = `${start}${buildLoremIpsum(loremLen)}${end}`;
    if (line.length > targetBytes) {
      line = line.slice(0, targetBytes);
    }
    console.log(line);
    totalCharsLogged += line.length + 1;
  }

  const firstStart = ` log-starter-count1 `;
  const firstEnd = ` log-end-count1 `;
  const firstOverhead = firstStart.length + firstEnd.length;
  const firstLorem = Math.max(0, targetBytes - firstOverhead);
  const firstLine = `${firstStart}${buildLoremIpsum(firstLorem)}${firstEnd}`;
  const firstPreview =
    firstLine.slice(0, 200) + (firstLine.length > 200 ? "…" : "");

  const lastStart = ` log-starter-count${count} `;
  const lastEnd = ` log-end-count${count} `;
  const lastOverhead = lastStart.length + lastEnd.length;
  const lastLorem = Math.max(0, targetBytes - lastOverhead);
  const lastLine = `${lastStart}${buildLoremIpsum(lastLorem)}${lastEnd}`;
  const lastPreview =
    lastLine.slice(0, 200) + (lastLine.length > 200 ? "…" : "");

  return NextResponse.json({
    count,
    sizeKb,
    targetBytesPerLog: targetBytes,
    totalLogsEmitted: count,
    approxStdoutBytes: totalCharsLogged,
    markerPattern: "log-starter-count{n} … log-end-count{n}",
    previewFirstLog: firstPreview,
    previewLastLog: count > 1 ? lastPreview : undefined,
  });
}
