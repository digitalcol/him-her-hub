import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/members/kitty")({
  beforeLoad: () => {
    throw redirect({ to: "/members/circle" });
  },
});
