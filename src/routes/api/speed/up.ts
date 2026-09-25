import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 2_000_000;

export const Route = createFileRoute("/api/speed/up")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const reader = request.body?.getReader();
        let bytes = 0;
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > MAX_BYTES) break;
          }
        } else {
          const buf = await request.arrayBuffer();
          bytes = buf.byteLength;
        }
        return Response.json(
          { bytes },
          {
            headers: {
              "Cache-Control": "no-store, no-transform",
            },
          },
        );
      },
    },
  },
});
