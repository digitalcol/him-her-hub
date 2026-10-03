import { createFileRoute } from "@tanstack/react-router";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/members/circle")({
  head: () => ({ meta: [{ title: "Your Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberCircle,
});

function MemberCircle() {
  const { circle, events } = Route.useLoaderData();
  const next = events[0];
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.city}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{circle.name}</h1>
      <p className="mt-4 text-base text-soft">{circle.members.length} couples in this Circle.</p>
      {next ? (
        <p className="mt-8 text-lg font-medium text-fg">
          Next up · {next.title}
          <span className="mt-1 block text-sm font-normal text-muted">
            {next.event_date} · {next.place}
          </span>
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted">Kitty remaining ₹{circle.kitty.toLocaleString("en-IN")}</p>
      {circle.whatsapp_url ? (
        <a href={circle.whatsapp_url} className="mt-8 inline-flex h-11 items-center text-sm font-medium text-fg" target="_blank" rel="noreferrer">
          Open WhatsApp
        </a>
      ) : (
        <p className="mt-8 text-sm text-muted">WhatsApp group not available yet.</p>
      )}
    </main>
  );
}
