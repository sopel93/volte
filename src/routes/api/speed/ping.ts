import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/speed/ping")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { t: Date.now() },
          {
            headers: {
              "Cache-Control": "no-store, no-transform",
            },
          },
        ),
    },
  },
});
