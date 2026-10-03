import { createFileRoute, Link } from "@tanstack/react-router";
import { listCircles } from "@/lib/club.server";

export const Route = createFileRoute("/admin/circles/")({
  head: () => ({ meta: [{ title: "Circles · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => listCircles(),
  component: Circles,
});

function Circles() {
  const rows = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Circles.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-1 py-4 sm:grid-cols-4 sm:items-baseline">
            <Link to="/admin/circles/$id" params={{ id: row.id }} className="font-medium text-fg">
              {row.name}
            </Link>
            <p className="text-sm text-muted">{row.city}</p>
            <p className="text-sm text-fg">
              {row.taken} / {row.capacity}
            </p>
            <p className="text-sm text-muted">{row.status}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
