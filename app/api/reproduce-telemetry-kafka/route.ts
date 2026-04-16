import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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
 * Writes one stdout line consisting only of `size` repeated ASCII characters (no OTLP wrapper).
 * HTTP response is small metadata only.
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
      { error: "Invalid `size` (positive integer, character count for the log line)." },
      { status: 400 }
    );
  }

  const line = "x".repeat(bodyChars);
  const lineBytes = Buffer.byteLength(line, "utf8");

  await writeStdoutLine(line);

  return NextResponse.json({
    ok: true,
    mode: "stdout",
    message: "Emitted one raw log line (x repeated `size` times).",
    bodyChars,
    lineBytes,
  });
}
