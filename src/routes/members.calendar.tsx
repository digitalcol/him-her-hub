import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { memberHome } from "@/lib/club.server";
import { proposeDate, setReply } from "@/lib/notices";

export const Route = createFileRoute("/members/calendar")({
  head: () => ({ meta: [{ title: "Dates · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: Calendar,
});

const CHOICES = [
  { id: "coming", label: "Coming" },
  { id: "available", label: "Available" },
  { id: "not-available", label: "Not available" },
  { id: "not-coming", label: "Not coming" },
] as const;

function Calendar() {
  const { events, replies, circle, you } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);

  async function propose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await proposeDate({
        data: {
          title: String(data.get("title") ?? ""),
          place: String(data.get("place") ?? ""),
          eventDate: String(data.get("date") ?? ""),
        },
      });
      form.reset();
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That date could not be added.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.name}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Dates.</h1>
      <p className="mt-4 max-w-xl text-sm text-pretty text-muted">
        Someone names a day. Everyone says if they can come. If the room is thin, move it.
      </p>
      <h2 className="mt-10 text-xs tracking-index text-muted uppercase">In this Circle</h2>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex justify-between py-3 text-sm">
            <span className="text-fg">
              {member.name}
              {member.id === you ? <span className="ml-2 text-muted">You</span> : null}
            </span>
            <span className="text-muted">{member.host_order ? `Hosts ${member.host_order}` : ""}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-10 space-y-8">
        {events.map((item) => {
          const mine = replies.filter((reply) => reply.event_id === item.id);
          const yours = mine.find((reply) => reply.couple_id === you);
          const current = yours ? replyOf(yours.choice, yours.available) : "";
          return (
            <li key={item.id} className="border-t border-line pt-6">
              <p className="text-lg font-medium text-fg">{item.title}</p>
              <p className="mt-1 text-sm text-muted">
                {item.event_date} · {item.place}
                {item.host_name ? ` · ${item.host_name} hosts` : ""}
              </p>
              <p className="mt-3 text-sm text-soft">{summary(mine)}</p>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {circle.members.map((member) => {
                  const reply = mine.find((row) => row.couple_id === member.id);
                  return (
                    <li key={member.id} className="flex justify-between py-3 text-sm">
                      <span className="text-fg">{member.name}</span>
                      <span className="text-muted">{reply ? labelOf(replyOf(reply.choice, reply.available)) : "No reply"}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={current === choice.id ? "h-11 bg-fg px-3 text-sm text-bg" : "h-11 border border-line px-3 text-sm text-fg"}
                    onClick={async () => {
                      await setReply({ data: { eventId: item.id, choice: choice.id } });
                      window.location.reload();
                    }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <form className="mt-12 space-y-4 border-t border-line pt-8" onSubmit={propose}>
        <p className="text-xs tracking-index text-muted uppercase">Propose a day</p>
        <label className="block text-sm text-fg">
          What
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3" name="title" required />
        </label>
        <label className="block text-sm text-fg">
          Day
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3" name="date" type="date" required />
        </label>
        <label className="block text-sm text-fg">
          Where
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3" name="place" required />
        </label>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
          Ask the Circle
        </button>
      </form>
    </main>
  );
}

function replyOf(choice: string | null, available: boolean) {
  if (choice === "coming" || choice === "available" || choice === "not-available" || choice === "not-coming") return choice;
  return available ? "available" : "not-available";
}

function labelOf(choice: string) {
  return CHOICES.find((item) => item.id === choice)?.label ?? "No reply";
}

function summary(rows: { choice: string | null; available: boolean }[]) {
  const counts = { coming: 0, available: 0, "not-available": 0, "not-coming": 0 };
  for (const row of rows) counts[replyOf(row.choice, row.available)] += 1;
  return `${counts.coming} coming · ${counts.available} available · ${counts["not-available"]} not available · ${counts["not-coming"]} not coming`;
}
