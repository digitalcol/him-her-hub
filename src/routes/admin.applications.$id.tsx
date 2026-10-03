import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { addAdminNote, getApplication, setApplicationStatus } from "@/lib/club-api";
import { ReviewPortrait } from "@/components/review-portrait";
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
  const [one, two] = row.people;

  async function move(status: AppStatus) {
    await setApplicationStatus({ data: { id: row.id, status } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Application</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{row.name}</h1>
      <p className="mt-4 text-sm text-muted">
        {row.area} · {row.label}
      </p>
      <div className="mt-8 flex gap-4">
        <ReviewPortrait label={one?.first_name ?? "One"} src={row.photos.one} attention={row.status === "NEW" || row.status === "REVIEWING"} />
        <ReviewPortrait label={two?.first_name ?? "Other"} src={row.photos.two} attention={row.status === "NEW" || row.status === "REVIEWING"} />
        <ReviewPortrait label="Together" src={row.photos.together} attention={row.status === "NEW" || row.status === "REVIEWING"} />
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <Person title="01 / One of you" person={one} photo={row.photos.one} />
        <Person title="02 / The other" person={two} photo={row.photos.two} />
      </div>
      <figure className="mt-10">
        <figcaption className="text-xs tracking-index text-muted uppercase">03 / You two</figcaption>
        {row.photos.together ? (
          <img src={row.photos.together} alt="" className="mt-3 aspect-square w-full max-w-sm rounded-full object-cover" />
        ) : (
          <p className="mt-3 text-sm text-muted">No photograph of the two of you.</p>
        )}
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <Fact label="Bangalore area" value={row.area} />
          <Fact label="Anniversary" value={row.anniversary || "—"} />
          <Fact label="Referred by" value={row.referral || "—"} />
        </dl>
      </figure>
      <div className="mt-10 max-w-3xl">
        <p className="text-xs tracking-index text-muted uppercase">04 / A little about you</p>
        <p className="mt-3 text-base text-pretty text-soft">{row.about}</p>
        {row.interests ? <p className="mt-4 text-sm text-muted">{row.interests}</p> : null}
        {row.organise ? <p className="mt-2 text-sm text-fg">Would organise · {row.organise}</p> : null}
      </div>
      <div className="mt-10 max-w-xl">
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
        {row.status !== "DECLINED" && row.status !== "ASSIGNED" && row.status !== "WAITING_FOR_CIRCLE" ? (
          <button type="button" className="h-11 px-2 text-muted" onClick={() => move("DECLINED")}>
            Decline
          </button>
        ) : null}
      </div>
    </main>
  );
}

function Person({
  title,
  person,
  photo,
}: {
  title: string;
  person?: {
    first_name: string;
    last_name: string;
    dob: string | null;
    phone: string | null;
    email: string | null;
    profession: string | null;
    instagram: string | null;
  };
  photo?: string;
}) {
  if (!person) return null;
  return (
    <section>
      <p className="text-xs tracking-index text-muted uppercase">{title}</p>
      {photo ? <img src={photo} alt="" className="mt-3 aspect-square w-full max-w-xs rounded-full object-cover" /> : <p className="mt-3 text-sm text-muted">No photograph.</p>}
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-fg">
        {person.first_name} {person.last_name}
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        <Fact label="Date of birth" value={person.dob || "—"} />
        <Fact label="Mobile" value={person.phone || "—"} />
        <Fact label="Email" value={person.email || "—"} />
        <Fact label="Profession" value={person.profession || "—"} />
        <Fact label="Instagram" value={person.instagram ? `@${person.instagram}` : "—"} />
      </dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}
