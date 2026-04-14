import { NextRequest, NextResponse } from "next/server";

const LOREM_BASE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";

const MARKER = "[log-chunk-test]";

function buildLoremIpsum(length: number): string {
  if (length <= 0) return "";
  const repeats = Math.ceil(length / LOREM_BASE.length);
  return LOREM_BASE.repeat(repeats).slice(0, length);
}

function parsePositiveInt(param: string | null, defaultValue: number): number {
  const n = parseInt(param ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

function buildPayload(
  dataLen: number,
  lineBytes: number,
  lineKb: number,
  responseKb: number
) {
  const data = buildLoremIpsum(dataLen);
  const logCount = data.length === 0 ? 0 : Math.ceil(data.length / lineBytes);
  return {
    marker: MARKER,
    lineKb,
    responseKb,
    data,
    logCount,
  };
}

function jsonByteLength(
  dataLen: number,
  lineBytes: number,
  lineKb: number,
  responseKb: number
): number {
  return JSON.stringify(
    buildPayload(dataLen, lineBytes, lineKb, responseKb)
  ).length;
}

/**
 * GET /api/log-chunk?lineKb=<n>&responseKb=<m>
 * - Each console.log line is at most `lineKb` KiB (1024-byte units; ASCII lorem ≈ same byte count).
 * - Response JSON body length is tuned to ≈ `responseKb` KiB.
 * Defaults: lineKb=1, responseKb=10
 */
export async function GET(request: NextRequest) {
  const lineKb = parsePositiveInt(
    request.nextUrl.searchParams.get("lineKb"),
    1
  );
  const responseKb = parsePositiveInt(
    request.nextUrl.searchParams.get("responseKb"),
    10
  );

  const lineBytes = lineKb * 1024;
  const responseBytes = responseKb * 1024;

  const minJson = jsonByteLength(0, lineBytes, lineKb, responseKb);
  if (responseBytes < minJson) {
    const minKb = Math.ceil(minJson / 1024);
    return NextResponse.json(
      {
        error: `responseKb too small for JSON wrapper (minimum ~${minKb} KiB, ~${minJson} bytes).`,
        lineKb,
        responseKb,
      },
      { status: 400 }
    );
  }

  let lo = 0;
  let hi = responseBytes;
  let bestDataLen = 0;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const len = jsonByteLength(mid, lineBytes, lineKb, responseKb);
    if (len <= responseBytes) {
      bestDataLen = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const payload = buildPayload(bestDataLen, lineBytes, lineKb, responseKb);
  const bodyStr = JSON.stringify(payload);
  const actualBytes = Buffer.byteLength(bodyStr, "utf8");

  for (let i = 0; i < payload.data.length; i += lineBytes) {
    console.log(payload.data.slice(i, i + lineBytes));
  }

  return new NextResponse(bodyStr, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Response-Byte-Length": String(actualBytes),
    },
  });
}
