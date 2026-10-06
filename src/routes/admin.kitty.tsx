import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/kitty")({
  validateSearch: (search: Record<string, unknown>): { circle: string } => ({
    circle: typeof search.circle === "string" ? search.circle : "",
  }),
  beforeLoad: ({ search }) => {
    if (search.circle) throw redirect({ to: "/admin/circles/$id", params: { id: search.circle } });
    throw redirect({ to: "/admin/circles" });
  },
});
