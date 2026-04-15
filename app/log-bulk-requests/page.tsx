"use client";

import { useState } from "react";

/** Fires one GET /api/log-bulk per log so each line is a separate request (better for batched collectors). */
export default function LogBulkRequestsPage() {
  const [totalLogs, setTotalLogs] = useState(5);
  const [sizeKb, setSizeKb] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendSeparateRequests() {
    setBusy(true);
    setStatus(null);
    const results: { index: number; ok: boolean; status: number }[] = [];
    try {
      for (let i = 1; i <= totalLogs; i++) {
        const url = `/api/log-bulk?count=1&sizeKb=${sizeKb}&startIndex=${i}`;
        const res = await fetch(url, { method: "GET" });
        results.push({ index: i, ok: res.ok, status: res.status });
        if (!res.ok) {
          setStatus(
            `Stopped at index ${i}: HTTP ${res.status}. Prior: ${results.length - 1} ok.`
          );
          setBusy(false);
          return;
        }
      }
      setStatus(
        `Done: ${totalLogs} separate requests (${results.filter((r) => r.ok).length} OK). Check Kafka / logs.`
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Log bulk — one HTTP request per log</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Each call hits <code className="rounded bg-zinc-100 px-1">/api/log-bulk?count=1&amp;sizeKb=…&amp;startIndex=…</code> so
          stdout is tied to separate invocations (often one record per request in Kafka).
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          API shortcut (orchestrates multiple <code className="rounded bg-zinc-100 px-1">/api/log-bulk</code> calls):{" "}
          <code className="break-all rounded bg-zinc-100 px-1 text-xs">
            GET /api/log-bulk-requests?count=5&amp;sizeKb=1
          </code>
          . This page is at <code className="rounded bg-zinc-100 px-1">/log-bulk-requests</code> (no{" "}
          <code className="rounded bg-zinc-100 px-1">/api</code> prefix).
        </p>

        <label className="mt-6 block text-sm font-medium">
          Total logs
          <input
            type="number"
            min={1}
            max={10000}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={totalLogs}
            onChange={(e) => setTotalLogs(Number(e.target.value) || 1)}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Size per log (KiB)
          <input
            type="number"
            min={1}
            max={1024}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={sizeKb}
            onChange={(e) => setSizeKb(Number(e.target.value) || 1)}
          />
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void sendSeparateRequests()}
          className="mt-6 w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : `Send ${totalLogs} separate requests`}
        </button>

        {status && (
          <p className="mt-4 text-sm text-zinc-700 whitespace-pre-wrap">{status}</p>
        )}
      </div>
    </div>
  );
}
