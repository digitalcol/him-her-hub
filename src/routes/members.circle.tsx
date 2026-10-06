import { createFileRoute } from "@tanstack/react-router";
import { ReviewPortrait } from "@/components/review-portrait";
import { memberHome } from "@/lib/club-api";

export const Route = createFileRoute("/members/circle")({
  head: () => ({ meta: [{ title: "Your Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberCircle,
});

function MemberCircle() {
  const { circle, events } = Route.useLoaderData();
  const next = events[0];
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Circle</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{circle.name}</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {circle.members.map((member) => {
          const [one, two] = member.partners;
          const href = `/apply?for=${member.id}`;
          return (
            <li key={member.id} className="py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex shrink-0 gap-4">
                  <ReviewPortrait href={href} label={one?.first_name || "One"} src={member.portraits.one} />
                  <ReviewPortrait href={href} label={two?.first_name || "Other"} src={member.portraits.two} />
                  <ReviewPortrait href={href} label="Together" src={member.portraits.together} />
                </div>
                <div className="min-w-0">
                  <a href={href} className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                    {member.name}
                  </a>
                  <p className={member.paid ? "mt-2 text-sm font-medium text-[#1f7a3a]" : "mt-2 text-sm font-medium text-[#b42318]"}>{member.paid ? "Paid" : "Unpaid"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {[member.host_label, member.area].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
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
      <div className="mt-8 flex flex-wrap gap-10">
        <p>
          <span className="block text-3xl font-semibold tracking-tight text-[#1f7a3a]">₹{Number(circle.opening).toLocaleString("en-IN")}</span>
          <span className="mt-1 block text-sm text-muted">Received</span>
        </p>
        <p>
          <span className="block text-3xl font-semibold tracking-tight text-[#b42318]">₹{Math.max(0, circle.members.length * Number(circle.each) - Number(circle.opening)).toLocaleString("en-IN")}</span>
          <span className="mt-1 block text-sm text-muted">To receive</span>
        </p>
      </div>
      {circle.whatsapp_url ? (
        <a href={circle.whatsapp_url} className="mt-6 inline-flex h-11 items-center text-sm font-medium text-fg underline" target="_blank" rel="noreferrer">
          Join the WhatsApp group
        </a>
      ) : null}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {circle.bills.length === 0 ? <li className="py-3 text-sm text-muted">No bills yet.</li> : null}
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
