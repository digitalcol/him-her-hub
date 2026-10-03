import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { assignCouple, getCircle, markKittyPaid, setWhatsApp } from "@/lib/club.server";

export const Route = createFileRoute("/admin/circles/$id")({
  head: () => ({ meta: [{ title: "Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getCircle({ data: { id: params.id } }),
  component: CircleDetail,
});

function CircleDetail() {
  const circle = Route.useLoaderData();
  const router = useRouter();
  const [link, setLink] = useState(circle.whatsapp_url ?? "");

  async function add(coupleId: string) {
    await assignCouple({ data: { circleId: circle.id, coupleId } });
    await router.invalidate();
  }

  async function paid(coupleId: string) {
    await markKittyPaid({ data: { circleId: circle.id, coupleId } });
    await router.invalidate();
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
        className="mt-6 flex items-end gap-3"
        onSubmit={async (event: FormEvent) => {
          event.preventDefault();
          await setWhatsApp({ data: { circleId: circle.id, url: link } });
          await router.invalidate();
        }}
      >
        <label className="text-sm text-fg">
          WhatsApp group
          <input className="mt-2 block w-72 border border-line bg-bg px-3 py-3" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://chat.whatsapp.com/..." />
        </label>
        <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
          Save
        </button>
      </form>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 py-3">
            <p className="font-medium text-fg">
              <span className="mr-3 text-muted">{member.host_order ?? "–"}</span>
              {member.name}
              <span className={member.paid ? "ml-3 text-sm font-medium text-[#1f7a3a]" : "ml-3 text-sm font-medium text-[#b42318]"}>
                {member.paid ? "Paid" : "Unpaid"}
              </span>
            </p>
            {member.paid ? null : (
              <button type="button" className="h-11 text-sm text-muted" onClick={() => paid(member.id)}>
                Mark paid
              </button>
            )}
          </li>
        ))}
      </ul>
      {circle.waiting.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs tracking-index text-muted uppercase">Waiting for a Circle</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {circle.waiting.map((couple) => (
              <li key={couple.id} className="flex items-center justify-between py-3">
                <p className="text-fg">
                  {couple.name}
                  <span className="text-muted"> · {couple.area}</span>
                </p>
                <button type="button" className="h-11 text-sm font-medium text-fg" onClick={() => add(couple.id)}>
                  Add to {circle.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
