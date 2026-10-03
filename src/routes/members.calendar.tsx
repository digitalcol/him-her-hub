import { createFileRoute } from "@tanstack/react-router";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/members/calendar")({
  head: () => ({ meta: [{ title: "Calendar · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: Calendar,
});

function Calendar() {
  const { events, votes, circle } = Route.useLoaderData();
  const yes = votes.filter((vote) => vote.available).length;
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.name}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Calendar.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {events.map((event) => (
          <li key={event.id} className="py-4">
            <p className="font-medium text-fg">{event.title}</p>
            <p className="mt-1 text-sm text-muted">
              {event.event_date} · {event.place} · {yes} of {votes.length} can make it
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
