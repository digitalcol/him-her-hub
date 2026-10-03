import { createFileRoute, Link } from "@tanstack/react-router";
import { clubOverview } from "@/lib/club-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Operations · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => clubOverview(),
  component: AdminHome,
});

function AdminHome() {
  const data = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">The desk.</h1>
      <p className="mt-4 max-w-xl text-base text-soft">
        {data.applications} applications. {data.waiting} waiting for a Circle.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {data.circles.map((circle) => (
          <li key={circle.id} className="flex items-baseline justify-between py-4">
            <Link to="/admin/circles/$id" params={{ id: circle.id }} className="font-medium text-fg">
              {circle.name}
            </Link>
            <p className="text-sm text-muted">
              {circle.taken} / {circle.capacity} · {circle.status}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
