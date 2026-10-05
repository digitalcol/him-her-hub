import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { assignCouple, getCircle, markKittyPaid, moveCouple, removeCouple, setWhatsApp } from "@/lib/club-api";

export const Route = createFileRoute("/admin/circles/$id")({
  head: () => ({ meta: [{ title: "Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getCircle({ data: { id: params.id } }),
  component: CircleDetail,
});

function CircleDetail() {
  const circle = Route.useLoaderData();
  const router = useRouter();
  const [link, setLink] = useState(circle.whatsapp_url ?? "");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLink(circle.whatsapp_url ?? "");
  }, [circle.whatsapp_url]);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await router.invalidate();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That could not be done.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.city}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{circle.name}</h1>
      <p className="mt-4 max-w-xl text-sm text-pretty text-soft">{circle.rules}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Kitty</dt>
          <dd className="text-fg">₹{Number(circle.kitty_amount).toLocaleString("en-IN")}</dd>
        </div>
        <div>
          <dt className="text-muted">Joining</dt>
          <dd className="text-fg">₹{Number(circle.joining_fee).toLocaleString("en-IN")}</dd>
        </div>
        <div>
          <dt className="text-muted">Annual renewal</dt>
          <dd className="text-fg">₹{Number(circle.renewal_fee).toLocaleString("en-IN")}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted">
        {circle.members.length} / {circle.capacity} allotted · kitty remaining ₹{circle.kitty.toLocaleString("en-IN")}
      </p>
      <form
        className="mt-6 max-w-xl"
        onSubmit={async (event: FormEvent) => {
          event.preventDefault();
          setNote(null);
          try {
            await setWhatsApp({ data: { circleId: circle.id, url: link } });
            await router.invalidate();
            setNote("Saved.");
          } catch (caught) {
            setNote(caught instanceof Error ? caught.message : "The link could not be saved.");
          }
        }}
      >
        <label className="block text-sm text-fg">
          WhatsApp group
          <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://chat.whatsapp.com/..." />
        </label>
        <div className="mt-3 flex items-center gap-4">
          <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
            Save
          </button>
          {note ? <p className="text-sm text-muted">{note}</p> : null}
        </div>
      </form>
      {error ? <p className="mt-6 text-sm text-soft">{error}</p> : null}
      <section className="mt-8">
        <p className="text-xs tracking-index text-muted uppercase">In this Circle</p>
        {circle.members.length === 0 ? <p className="mt-3 text-sm text-muted">No one is in this Circle yet.</p> : null}
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {circle.members.map((member) => (
            <li key={member.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-medium text-fg">
                  <span className="mr-3 text-muted">{member.host_order ?? "–"}</span>
                  {member.name}
                  <span className="text-sm font-normal text-muted"> · {member.area}</span>
                  <span className={member.paid ? "ml-3 text-sm font-medium text-[#1f7a3a]" : "ml-3 text-sm font-medium text-[#b42318]"}>
                    {member.paid ? "Paid" : "Unpaid"}
                  </span>
                </p>
                <div className="flex gap-4">
                  {member.paid ? null : (
                    <button type="button" className="h-11 text-sm text-muted" onClick={() => run(() => markKittyPaid({ data: { circleId: circle.id, coupleId: member.id } }))}>
                      Mark paid
                    </button>
                  )}
                  <button type="button" className="h-11 text-sm text-muted" onClick={() => run(() => removeCouple({ data: { circleId: circle.id, coupleId: member.id } }))}>
                    Remove
                  </button>
                </div>
              </div>
              {circle.others.length > 0 ? (
                <form
                  className="mt-2 flex flex-wrap items-center gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const toCircleId = String(new FormData(event.currentTarget).get("to") ?? "");
                    void run(() => moveCouple({ data: { coupleId: member.id, toCircleId } }));
                  }}
                >
                  <label className="text-sm text-muted">
                    Move to
                    <select name="to" className="ml-2 border border-line bg-bg px-2 py-2 text-fg">
                      {circle.others.map((other) => (
                        <option key={other.id} value={other.id}>
                          {other.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="h-11 text-sm font-medium text-fg">
                    Move
                  </button>
                </form>
              ) : (
                <p className="mt-2 text-sm text-muted">Open another Circle before you can move someone.</p>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <p className="text-xs tracking-index text-muted uppercase">Add someone</p>
        {circle.waiting.length === 0 ? <p className="mt-3 text-sm text-muted">No one is waiting. Approve an application first.</p> : null}
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {circle.waiting.map((couple) => (
            <li key={couple.id} className="flex items-center justify-between py-3">
              <p className="text-fg">
                {couple.name}
                <span className="text-muted"> · {couple.area}</span>
              </p>
              <button type="button" className="h-11 text-sm font-medium text-fg" onClick={() => run(() => assignCouple({ data: { circleId: circle.id, coupleId: couple.id } }))}>
                Add to {circle.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
