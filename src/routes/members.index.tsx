import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { memberHome, sendOwnKitty, updateOwnDetails } from "@/lib/club-api";

export const Route = createFileRoute("/members/")({
  head: () => ({ meta: [{ title: "Member · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberPage,
});

function MemberPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const profile = data.profile;
  const [note, setNote] = useState<string | null>(null);
  const [area, setArea] = useState(profile?.area ?? "");
  const [about, setAbout] = useState(profile?.about ?? "");
  const [people, setPeople] = useState(profile?.people ?? []);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote(null);
    try {
      await updateOwnDetails({ data: { area, about, people } });
      setNote("Saved.");
      await router.invalidate();
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Those details could not be saved.");
    }
  }

  async function onPay() {
    setNote(null);
    try {
      await sendOwnKitty();
      setNote("Payment sent. Operations will confirm it.");
      await router.invalidate();
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "The payment could not be sent.");
    }
  }

  if (!profile) return null;
  const money = `₹${Number(data.circle.kitty_amount).toLocaleString("en-IN")}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{data.circle.name}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{profile.name}</h1>
      <p className="mt-4 max-w-xl text-sm text-pretty text-soft">Your page. Update your details, pay the kitty, and read what has been sent to your Circle.</p>

      <section className="mt-10">
        <p className="text-xs tracking-index text-muted uppercase">Kitty</p>
        <p className="mt-3 text-lg font-medium text-fg">
          {money}
          <span className={profile.payment === "Paid" ? "ml-3 text-sm font-medium text-[#1f7a3a]" : profile.payment === "Sent" ? "ml-3 text-sm font-medium text-muted" : "ml-3 text-sm font-medium text-[#b42318]"}>
            {profile.payment === "Paid" ? "Paid" : profile.payment === "Sent" ? "Sent" : "Due"}
          </span>
        </p>
        {profile.payment === "Due" ? (
          <button type="button" className="mt-4 h-11 bg-fg px-4 text-sm text-bg" onClick={() => void onPay()}>
            I have paid the kitty
          </button>
        ) : null}
      </section>

      {profile.photos.length > 0 ? (
        <section className="mt-10">
          <p className="text-xs tracking-index text-muted uppercase">Pictures</p>
          <div className="mt-4 flex gap-3">
            {profile.photos.map((photo) => (
              <img key={photo.role} src={photo.src} alt="" className="size-24 rounded-full object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <p className="text-xs tracking-index text-muted uppercase">Messages</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {data.notices.length === 0 ? <li className="py-4 text-sm text-muted">No messages yet.</li> : null}
          {data.notices.map((notice) => (
            <li key={notice.id} className="py-4">
              <p className="font-medium text-fg">{notice.title}</p>
              <p className="mt-1 text-sm text-pretty text-soft">{notice.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <form className="mt-10 space-y-4" onSubmit={onSave}>
        <p className="text-xs tracking-index text-muted uppercase">Your details</p>
        <label className="block text-sm text-fg">
          Area
          <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={area} onChange={(event) => setArea(event.target.value)} />
        </label>
        <label className="block text-sm text-fg">
          About you
          <textarea className="mt-2 block w-full border border-line bg-bg px-3 py-3" rows={3} value={about} onChange={(event) => setAbout(event.target.value)} />
        </label>
        {people.map((person, index) => (
          <fieldset key={person.id} className="space-y-4 border-t border-line pt-4">
            <legend className="text-sm font-medium text-fg">
              {person.first_name} {person.last_name}
            </legend>
            <label className="block text-sm text-fg">
              Phone
              <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={person.phone} onChange={(event) => setPeople(updatePerson(people, index, { phone: event.target.value }))} />
            </label>
            <label className="block text-sm text-fg">
              Email
              <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" type="email" value={person.email} onChange={(event) => setPeople(updatePerson(people, index, { email: event.target.value }))} />
            </label>
            <label className="block text-sm text-fg">
              Profession
              <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={person.profession} onChange={(event) => setPeople(updatePerson(people, index, { profession: event.target.value }))} />
            </label>
            <label className="block text-sm text-fg">
              Instagram
              <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={person.instagram} onChange={(event) => setPeople(updatePerson(people, index, { instagram: event.target.value }))} />
            </label>
          </fieldset>
        ))}
        {note ? <p className="text-sm text-soft">{note}</p> : null}
        <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
          Save details
        </button>
      </form>

      <Link to="/members/circle" className="mt-10 inline-flex h-11 items-center text-sm font-medium text-fg underline">
        Open {data.circle.name}
      </Link>
    </main>
  );
}

function updatePerson<T extends { id: string }>(people: T[], index: number, patch: Partial<T>) {
  return people.map((person, item) => (item === index ? { ...person, ...patch } : person));
}
