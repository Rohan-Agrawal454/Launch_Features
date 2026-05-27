// functions/streaming.js

export default function handler(request, response) {
  const intervalMs = Math.max(50, Number(request.query?.intervalMs ?? 250));
  const count = Math.max(1, Number(request.query?.count ?? 20));

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");

  if (typeof response.flushHeaders === "function") response.flushHeaders();

  response.write(`event: open\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  let i = 0;
  const timer = setInterval(() => {
    response.write(
      `event: message\ndata: ${JSON.stringify({
        index: i,
        time: new Date().toISOString(),
      })}\n\n`
    );
    i += 1;

    if (i >= count) {
      clearInterval(timer);
      response.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`);
      response.end();
    }
  }, intervalMs);

  request.on("close", () => {
    clearInterval(timer);
  });
}

