import { createFileRoute } from "@tanstack/react-router";
import { listApplications } from "@/lib/club-api";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members · Operations · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => listApplications(),
  component: AdminMembers,
});

function AdminMembers() {
  const rows = Route.useLoaderData().filter((row) => row.assigned);
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Members.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="flex items-baseline justify-between py-4">
            <p className="font-medium text-fg">{row.name}</p>
            <p className="text-sm text-muted">{row.area}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
