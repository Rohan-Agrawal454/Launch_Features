import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Default body length that tends to exceed typical ~1MB Kafka limits after your log pipeline encodes this line. */
const DEFAULT_BODY_CHARS = 1_100_000;

function writeStdoutLine(line: string): Promise<void> {
  return new Promise((resolve, reject) => {
    process.stdout.write(line + "\n", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * GET/POST /api/reproduce-telemetry-kafka?size=1100000
 *
 * Builds the same OTLP-shaped JSON as `test2.js` (one huge `body.stringValue`) and writes **one line**
 * to **application stdout** — no outbound telemetry HTTP call. Your log collector → Kafka path can
 * surface "Message was too large" / Failed to send kafkaMessage when this line is ingested.
 *
 * HTTP response is small metadata only (the giant payload is not returned in the body).
 */
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const bodyChars = sizeParam
    ? parseInt(sizeParam, 10)
    : DEFAULT_BODY_CHARS;

  if (!Number.isFinite(bodyChars) || bodyChars <= 0) {
    return NextResponse.json(
      { error: "Invalid `size` (positive integer, character count for body.stringValue)." },
      { status: 400 }
    );
  }

  const record = {
    resourceLogs: [
      {
        resource: {},
        scopeLogs: [
          {
            scope: {},
            logRecords: [
              {
                timeUnixNano: String(Date.now() * 1_000_000),
                severityNumber: 9,
                severityText: "INFO",
                body: { stringValue: "x".repeat(bodyChars) },
              },
            ],
          },
        ],
      },
    ],
  };

  const line = JSON.stringify(record);
  const jsonPayloadBytes = Buffer.byteLength(line, "utf8");

  await writeStdoutLine(line);

  return NextResponse.json({
    ok: true,
    mode: "stdout",
    message:
      "Emitted one OTLP-shaped JSON line to stdout (same shape as test2.js). Check collector/Kafka logs for oversized message errors.",
    bodyChars,
    jsonPayloadBytes,
  });
}
