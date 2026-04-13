import { NextRequest, NextResponse } from "next/server";

// GET /api/log-size?size=<kb>
// Prints a single console.log line of roughly `size` KB.
export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const sizeKb = parseInt(sizeParam ?? "", 10);

  if (!Number.isFinite(sizeKb) || sizeKb <= 0) {
    return NextResponse.json(
      {
        error:
          "Provide a positive integer `size` query parameter (in KB). Example: ?size=1024",
      },
      { status: 400 }
    );
  }

  const targetBytes = sizeKb * 1024;
  // console.log appends a newline, so payload = targetBytes - 1.
  const payloadLen = Math.max(0, targetBytes - 1);
  const line = "x".repeat(payloadLen);

  console.log(line);

  return NextResponse.json({
    requestedSizeKb: sizeKb,
    targetBytes,
    bytesWritten: payloadLen + 1,
  });
}
