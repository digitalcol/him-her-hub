import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { addAdminNote, getApplication, setApplicationStatus } from "@/lib/club.server";
import type { AppStatus } from "@/lib/club-domain";

export const Route = createFileRoute("/admin/applications/$id")({
  head: () => ({ meta: [{ title: "Application · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getApplication({ data: { id: params.id } }),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const row = Route.useLoaderData();
  const router = useRouter();
  const [note, setNote] = useState("");

  async function move(status: AppStatus) {
    await setApplicationStatus({ data: { id: row.id, status } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Application</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{row.name}</h1>
      <p className="mt-4 text-sm text-muted">
        {row.area} · {row.label}
      </p>
      <p className="mt-6 max-w-xl text-base text-pretty text-soft">{row.about}</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {row.people.map((person) => (
          <li key={person.first_name} className="py-3 text-sm text-fg">
            {person.first_name}
            {person.profession ? ` · ${person.profession}` : ""}
          </li>
        ))}
      </ul>
      {row.interests ? <p className="mt-6 text-sm text-muted">{row.interests}</p> : null}
      <div className="mt-10">
        <p className="text-xs tracking-index text-muted uppercase">Private notes</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {row.notes.length === 0 ? <li className="py-3 text-sm text-muted">No notes.</li> : null}
          {row.notes.map((item) => (
            <li key={item.id} className="py-3 text-sm text-fg">
              {item.body}
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex items-end gap-3"
          onSubmit={async (event: FormEvent) => {
            event.preventDefault();
            await addAdminNote({ data: { coupleId: row.id, body: note } });
            setNote("");
            await router.invalidate();
          }}
        >
          <label className="text-sm text-fg">
            Add a note
            <input className="mt-2 block border border-line bg-bg px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
            Save
          </button>
        </form>
      </div>
      <div className="mt-8 flex gap-4 text-sm">
        {row.status === "NEW" ? (
          <button type="button" className="h-11 bg-fg px-4 text-bg" onClick={() => move("REVIEWING")}>
            Start review
          </button>
        ) : null}
        {row.status === "REVIEWING" || row.status === "HOLD" ? (
          <button type="button" className="h-11 bg-fg px-4 text-bg" onClick={() => move("WAITING_FOR_CIRCLE")}>
            Approve
          </button>
        ) : null}
        {row.status !== "DECLINED" && row.status !== "APPROVED" ? (
          <button type="button" className="h-11 px-2 text-muted" onClick={() => move("DECLINED")}>
            Decline
          </button>
        ) : null}
      </div>
    </main>
  );
}
