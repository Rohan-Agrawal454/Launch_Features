import { NextRequest, NextResponse } from "next/server";

/** Grep-friendly markers so this line is easy to find in log pipelines. */
const LOG_LINE_START = "[log-size-test] starting ";
const LOG_LINE_END = " [log-size-test] ending";

const LOREM_BASE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ";

function buildLoremIpsum(length: number): string {
  if (length <= 0) return "";
  const repeats = Math.ceil(length / LOREM_BASE.length);
  return LOREM_BASE.repeat(repeats).slice(0, length);
}

// GET /api/log-size?size=<kb>
// Prints a single console.log line of roughly `size` KB.
export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const sizeKb = parseInt(sizeParam ?? "", 10);

  // if (!Number.isFinite(sizeKb) || sizeKb <= 0) {
  //   return NextResponse.json(
  //     {
  //       error:
  //         "Provide a positive integer `size` query parameter (in KB). Example: ?size=1024",
  //     },
  //     { status: 400 }
  //   );
  // }

  const targetBytes = sizeKb * 1024;
  // console.log appends a newline, so payload = targetBytes - 1.
  const payloadLen = Math.max(0, targetBytes - 1);
  const markerOverhead = LOG_LINE_START.length + LOG_LINE_END.length;
  const loremLen = Math.max(0, payloadLen - markerOverhead);
  let line = `${LOG_LINE_START}${buildLoremIpsum(loremLen)}${LOG_LINE_END}`;
  if (line.length > payloadLen) {
    line = line.slice(0, payloadLen);
  }

  console.log(line);

  return NextResponse.json({
    data: line,
    markers: { start: LOG_LINE_START, end: LOG_LINE_END },
    requestedSizeKb: sizeKb,
    targetBytes,
    bytesWritten: line.length + 1,
  });
}
