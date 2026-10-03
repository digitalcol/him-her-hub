import { createFileRoute } from "@tanstack/react-router";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: Events,
});

function Events() {
  const { events, votes } = Route.useLoaderData();
  const yes = votes.filter((vote) => vote.available).length;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Events.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {events.map((event) => (
          <li key={event.id} className="py-4">
            <p className="font-medium text-fg">{event.title}</p>
            <p className="mt-1 text-sm text-muted">
              {event.event_date} · {event.place} · {yes} available
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
