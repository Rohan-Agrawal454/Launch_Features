"use client";

import { useEffect, useRef, useState } from "react";

type StreamEvent =
  | { type: "open"; data: unknown; at: string }
  | { type: "message"; data: unknown; at: string }
  | { type: "done"; data: unknown; at: string }
  | { type: "error"; data: string; at: string };

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

type Mode = "streaming" | "buffered";

export default function StreamingPage() {
  const [mode, setMode] = useState<Mode>("streaming");
  const [count, setCount] = useState(20);
  const [intervalMs, setIntervalMs] = useState(250);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [busy, setBusy] = useState(false);

  const esRef = useRef<EventSource | null>(null);

  function pushEvent(e: StreamEvent) {
    setEvents((prev) => {
      const next = [...prev, e];
      return next.length > 500 ? next.slice(next.length - 500) : next;
    });
  }

  function disconnect() {
    const es = esRef.current;
    if (es) es.close();
    esRef.current = null;
    setConnected(false);
  }

  function buildUrl(path: string) {
    const u = new URL(path, window.location.origin);
    u.searchParams.set("count", String(count));
    u.searchParams.set("intervalMs", String(intervalMs));
    return u.toString();
  }

  function connectStreaming() {
    disconnect();
    setEvents([]);

    const url = buildUrl("/api/streaming");
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("open", () => {
      setConnected(true);
      pushEvent({ type: "open", data: { ok: true }, at: nowIso() });
    });

    es.addEventListener("message", (evt) => {
      pushEvent({ type: "message", data: safeJsonParse((evt as MessageEvent).data), at: nowIso() });
    });

    es.addEventListener("done", (evt) => {
      pushEvent({ type: "done", data: safeJsonParse((evt as MessageEvent).data), at: nowIso() });
      disconnect();
    });

    es.addEventListener("error", () => {
      pushEvent({ type: "error", data: "EventSource error (connection dropped or endpoint not SSE).", at: nowIso() });
      disconnect();
    });
  }

  async function runBuffered() {
    disconnect();
    setEvents([]);
    setBusy(true);
    pushEvent({ type: "open", data: { ok: true }, at: nowIso() });

    try {
      const url = buildUrl("/api/buffered");
      const res = await fetch(url, { method: "GET" });
      const body = (await res.json()) as {
        ok: boolean;
        messages?: { index: number; time: string }[];
        error?: string;
      };

      if (!res.ok || !body.ok) {
        pushEvent({
          type: "error",
          data: body?.error ? String(body.error) : `HTTP ${res.status}`,
          at: nowIso(),
        });
        return;
      }

      for (const m of body.messages ?? []) {
        pushEvent({ type: "message", data: m, at: nowIso() });
      }
      pushEvent({ type: "done", data: { done: true }, at: nowIso() });
    } catch (e) {
      pushEvent({
        type: "error",
        data: e instanceof Error ? e.message : String(e),
        at: nowIso(),
      });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Response mode demo</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pick <code className="rounded bg-zinc-100 px-1">Streaming</code> (SSE) or{" "}
          <code className="rounded bg-zinc-100 px-1">Buffered</code> (normal JSON) and click Run.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="mode"
                checked={mode === "streaming"}
                onChange={() => setMode("streaming")}
              />
              Streaming
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="mode"
                checked={mode === "buffered"}
                onChange={() => setMode("buffered")}
              />
              Buffered
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Count
              <input
                type="number"
                min={1}
                max={10000}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </label>

            <label className="block text-sm font-medium">
              Interval (ms)
              <input
                type="number"
                min={50}
                max={60000}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value) || 250)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => (mode === "streaming" ? connectStreaming() : void runBuffered())}
              disabled={busy || (mode === "streaming" && connected)}
              className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
            >
              {mode === "streaming"
                ? connected
                  ? "Streaming…"
                  : "Run"
                : busy
                  ? "Running…"
                  : "Run"}
            </button>

            <button
              type="button"
              onClick={() => disconnect()}
              disabled={mode !== "streaming" || !connected}
              className="w-full rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50 sm:w-auto"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Events</h2>
            <button
              type="button"
              onClick={() => setEvents([])}
              className="text-xs font-medium text-zinc-700 underline"
            >
              Clear
            </button>
          </div>

          <div className="mt-2 max-h-[55vh] overflow-auto rounded border border-zinc-200 bg-zinc-50 p-3">
            {events.length === 0 ? (
              <div className="text-sm text-zinc-600">No events yet.</div>
            ) : (
              <ul className="space-y-2">
                {events.map((e, idx) => (
                  <li key={idx} className="rounded bg-white p-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-800">
                        {e.type}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">{e.at}</span>
                    </div>
                    <pre className="mt-2 overflow-auto rounded bg-zinc-950 p-2 text-xs text-zinc-100">
                      {typeof e.data === "string" ? e.data : JSON.stringify(e.data, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

