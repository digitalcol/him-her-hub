import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { memberOpen } from "@/lib/member-session";

export const Route = createFileRoute("/members")({
  beforeLoad: async () => {
    if (await memberOpen()) return;
    throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
