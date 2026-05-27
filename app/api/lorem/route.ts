import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "ut",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
];

function parsePositiveInt(param: string | null, defaultValue: number): number {
  const n = parseInt(param ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

function buildLoremWords(wordCount: number): string {
  if (wordCount <= 0) return "";
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(LOREM_WORDS[i % LOREM_WORDS.length]!);
  }
  return words.join(" ");
}

/**
 * GET /api/lorem?words=<n>
 * Returns a buffered JSON response with lorem ipsum text.
 */
export async function GET(request: NextRequest) {
  const words = parsePositiveInt(request.nextUrl.searchParams.get("words"), 100);
  const text = buildLoremWords(words);

  return NextResponse.json({
    ok: true,
    words,
    text,
    charCount: text.length,
  });
}
