import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Default ~1.1M chars so marshaled OTLP batch can exceed typical 1MB Kafka limits when sent as one message. */
const DEFAULT_BODY_CHARS = 1_100_000;

/**
 * POST or GET /api/reproduce-large-log?size=1100000
 * Forwards one OTLP JSON log record to the OTLP HTTP receiver (bypasses app stdout).
 *
 * Env:
 * - OTLP_HTTP_URL — full URL (default http://localhost:4318/v1/logs)
 * - OTLP_AUTH_TOKEN — optional Bearer token (omit for local receivers with no auth)
 *
 * Optional: header x-otlp-token on this request overrides the bearer token (dev only).
 */
async function handle(request: NextRequest) {
  const otlpUrl = "https://dev-launch-api.csnonprod.com/telemetry"
  const token = "03ff739b-ed9f-4042-9b91-c7161250c503"

  const sizeParam = request.nextUrl.searchParams.get("size");
  const bodyChars = sizeParam
    ? parseInt(sizeParam, 10)
    : DEFAULT_BODY_CHARS;

  if (!Number.isFinite(bodyChars) || bodyChars <= 0) {
    return NextResponse.json(
      { error: "Invalid or missing positive integer `size` (character count for body.stringValue)." },
      { status: 400 }
    );
  }

  const timeUnixNano = `${Date.now() * 1_000_000}`;

  const payload = {
    resourceLogs: [
      {
        resource: {},
        scopeLogs: [
          {
            scope: {},
            logRecords: [
              {
                timeUnixNano,
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

  const body = JSON.stringify(payload);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let otlpResponseText: string;
  let otlpStatus: number;

  try {
    const res = await fetch(otlpUrl, {
      method: "POST",
      headers,
      body,
    });
    otlpStatus = res.status;
    otlpResponseText = await res.text();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to reach OTLP HTTP endpoint",
        detail: message,
        otlpUrl,
        bodyChars,
      },
      { status: 502 }
    );
  }

  const preview =
    otlpResponseText.length > 2000
      ? `${otlpResponseText.slice(0, 2000)}…`
      : otlpResponseText;

  return NextResponse.json(
    {
      ok: otlpStatus >= 200 && otlpStatus < 300,
      otlpStatus,
      otlpUrl,
      bodyChars,
      jsonPayloadBytes: Buffer.byteLength(body, "utf8"),
      otlpResponsePreview: preview,
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
