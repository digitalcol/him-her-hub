import { createFileRoute } from "@tanstack/react-router";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: Events,
});

function Events() {
  const { events, replies, circle } = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Events.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {events.map((event) => {
          const mine = replies.filter((reply) => reply.event_id === event.id);
          const yes = mine.filter((reply) => reply.available || reply.choice === "coming" || reply.choice === "available").length;
          return (
            <li key={event.id} className="py-4">
              <p className="font-medium text-fg">{event.title}</p>
              <p className="mt-1 text-sm text-muted">
                {circle.name} · {event.event_date} · {event.place}
                {event.host_name ? ` · ${event.host_name} hosts` : ""} · {yes} can come
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
