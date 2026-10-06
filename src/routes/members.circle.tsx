import { createFileRoute } from "@tanstack/react-router";
import { PaidMark } from "@/components/kitty-statement";
import { memberHome } from "@/lib/club-api";

export const Route = createFileRoute("/members/circle")({
  head: () => ({ meta: [{ title: "Your Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberCircle,
});

function MemberCircle() {
  const { circle, events, notices } = Route.useLoaderData();
  const next = events[0];
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Your Circle</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{circle.name}</h1>
      {circle.rules ? <p className="mt-4 max-w-xl text-base text-pretty text-soft">{circle.rules}</p> : null}
      {notices.length > 0 ? (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {notices.map((notice) => (
            <li key={notice.id} className="py-4">
              <p className="text-xs tracking-index text-muted uppercase">{notice.circle_id ? circle.name : "Everyone"}</p>
              <p className="mt-1 font-medium text-fg">{notice.title}</p>
              <p className="mt-1 text-sm text-pretty text-soft">{notice.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Kitty contribution</dt>
          <dd className="mt-1 text-fg">₹{Number(circle.kitty_amount).toLocaleString("en-IN")}</dd>
        </div>
        <div>
          <dt className="text-muted">Joining fee</dt>
          <dd className="mt-1 text-fg">₹{Number(circle.joining_fee).toLocaleString("en-IN")}</dd>
        </div>
        <div>
          <dt className="text-muted">Annual renewal</dt>
          <dd className="mt-1 text-fg">₹{Number(circle.renewal_fee).toLocaleString("en-IN")}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted">Kitty remaining ₹{circle.kitty.toLocaleString("en-IN")}</p>
      {circle.whatsapp_url ? (
        <a href={circle.whatsapp_url} className="mt-8 inline-flex h-11 items-center bg-fg px-4 text-sm font-medium text-bg" target="_blank" rel="noreferrer">
          Join the WhatsApp group
        </a>
      ) : (
        <p className="mt-8 text-sm text-muted">WhatsApp group not available yet.</p>
      )}
      <h2 className="mt-12 text-xs tracking-index text-muted uppercase">Hosting order</h2>
      <ol className="mt-3 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex gap-4 py-3 text-sm">
            <span className="w-16 text-muted">{member.host_label ?? member.host_order ?? "–"}</span>
            {member.filled ? (
              <span className="text-fg">
                {member.name}
                <PaidMark paid={member.paid} />
              </span>
            ) : (
              <a href={`/apply?for=${member.id}`} className="text-fg underline">
                {member.name}
                <PaidMark paid={member.paid} />
              </a>
            )}
          </li>
        ))}
      </ol>
      {circle.bills.length > 0 ? (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {circle.bills.map((bill) => (
            <li key={bill.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-fg">
                {bill.note}
                <span className="text-muted"> − ₹{bill.amount.toLocaleString("en-IN")}</span>
              </span>
              <span className="text-fg">₹{bill.balance.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {next ? (
        <p className="mt-8 text-lg font-medium text-fg">
          Next · {next.title}
          <span className="mt-1 block text-sm font-normal text-muted">
            {next.event_date} · {next.place}
            {next.host_name ? ` · hosted by ${next.host_name}` : ""}
          </span>
        </p>
      ) : null}
    </main>
  );
}
