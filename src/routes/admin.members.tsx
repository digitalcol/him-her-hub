import { createFileRoute, Link } from "@tanstack/react-router";
import { listApplications } from "@/lib/club-api";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members · Operations · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => listApplications(),
  component: AdminMembers,
});

function AdminMembers() {
  const rows = Route.useLoaderData().filter(
    (row) => row.assigned || row.status === "ASSIGNED" || row.status === "WAITING_FOR_CIRCLE" || row.status === "APPROVED",
  );
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Members.</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">Everyone who has been accepted. A Circle is where they sit. This list keeps them all.</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {rows.map((row) => {
          const filled = row.partners.some((person) => person.email);
          return (
            <li key={row.id} className="flex items-baseline justify-between gap-4 py-4">
              {filled ? (
                <Link to="/admin/applications/$id" params={{ id: row.id }} className="font-medium text-fg">
                  {row.name}
                  <span className="ml-2 text-sm font-normal text-muted">{row.area}</span>
                </Link>
              ) : (
                <a href={`/apply?for=${row.id}`} className="font-medium text-fg underline">
                  {row.name}
                  <span className="ml-2 text-sm font-normal text-muted">Form still open</span>
                </a>
              )}
              <p className="text-sm text-fg">{row.circle ?? "Waiting for a circle"}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}