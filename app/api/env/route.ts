import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/env
 * Returns all environment variables (raw values).
 */
export async function GET() {
  const env = process.env as Record<string, string | undefined>;

  const raw: Record<string, string> = {};

  for (const [k, v] of Object.entries(env)) {
    if (typeof v !== "string") continue;
    raw[k] = v;
  }

  // Prints to server logs (stdout) for debugging.
  console.log("[env] keys:", Object.keys(env).sort());

  return NextResponse.json(
    {
      ok: true,
      raw,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

