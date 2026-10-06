import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { operationsOpen } from "@/lib/operations-lock";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (await operationsOpen()) return;
    throw redirect({
      to: "/operations",
      search: { next: location.pathname },
    });
  },
  component: () => <Outlet />,
});
