import { createFileRoute } from "@tanstack/react-router";
import { loadPortraitBytes } from "@/lib/club-api";

export const Route = createFileRoute("/portraits/$coupleId/$role")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const image = await loadPortraitBytes(params.coupleId, params.role);
        if (!image) return new Response("Not found", { status: 404 });
        return new Response(image.bytes, {
          headers: {
            "content-type": image.mime,
            "cache-control": "private, max-age=3600",
          },
        });
      },
    },
  },
});
