import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { listApplications, setApplicationStatus } from "@/lib/club.server";
import type { AppStatus } from "@/lib/club-domain";

export const Route = createFileRoute("/admin/applications/")({
  head: () => ({ meta: [{ title: "Applications · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => listApplications(),
  component: Applications,
});

function Applications() {
  const rows = Route.useLoaderData();
  const router = useRouter();

  async function move(id: string, status: AppStatus) {
    await setApplicationStatus({ data: { id, status } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Applications.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-2 py-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center">
            <Link to="/admin/applications/$id" params={{ id: row.id }} className="font-medium text-fg">
              {row.name}
            </Link>
            <p className="text-sm text-muted">{row.area}</p>
            <p className="text-sm text-fg">{row.label}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {row.status === "NEW" ? (
                <button type="button" className="h-11" onClick={() => move(row.id, "REVIEWING")}>
                  Start review
                </button>
              ) : null}
              {row.status === "REVIEWING" || row.status === "HOLD" ? (
                <button type="button" className="h-11" onClick={() => move(row.id, "APPROVED")}>
                  Approve
                </button>
              ) : null}
              {row.status === "REVIEWING" ? (
                <button type="button" className="h-11 text-muted" onClick={() => move(row.id, "HOLD")}>
                  Hold
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
