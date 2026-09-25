import { createFileRoute } from "@tanstack/react-router";

const MIN_BYTES = 16_384;
const MAX_BYTES = 6_000_000;
const CHUNK = 64 * 1024;

export const Route = createFileRoute("/api/speed/down")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const requested = Number(url.searchParams.get("bytes") ?? "2e6");
        const total = Math.min(
          Math.max(Number.isFinite(requested) ? requested : 2_000_000, MIN_BYTES),
          MAX_BYTES,
        );

        let sent = 0;
        const stream = new ReadableStream<Uint8Array>({
          pull(controller) {
            if (sent >= total) {
              controller.close();
              return;
            }
            const n = Math.min(CHUNK, total - sent);
            const chunk = new Uint8Array(n);
            crypto.getRandomValues(chunk);
            controller.enqueue(chunk);
            sent += n;
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": String(total),
            "Cache-Control": "no-store, no-transform",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
