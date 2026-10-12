import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PaidMark } from "@/components/kitty-statement";
import { comingUp, listCircles, markKittyPaid } from "@/lib/club-api";

export const Route = createFileRoute("/admin/circles/")({
  head: () => ({ meta: [{ title: "Circles · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => Promise.all([listCircles(), comingUp()]),
  component: Circles,
});

function Circles() {
  const [rows, dates] = Route.useLoaderData();
  const router = useRouter();

  async function receive(circleId: string, coupleId: string) {
    await markKittyPaid({ data: { circleId, coupleId } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Circles.</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">Tap a name when the kitty has come in. Tap it again if that was a mistake.</p>
      <Link to="/admin/circles/new" className="mt-6 inline-flex h-11 items-center text-sm font-medium text-fg">
        New Circle
      </Link>
      <section className="mt-10">
        <p className="text-xs tracking-index text-muted uppercase">Coming up</p>
        {dates.length === 0 ? <p className="mt-3 text-sm text-muted">Birthdays and anniversaries appear once a form has a date.</p> : null}
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {dates.map((item) => (
            <li key={`${item.kind}-${item.name}-${item.label}`} className="flex items-baseline justify-between gap-4 py-3 text-sm">
              <span className="text-fg">
                {item.name}
                <span className="ml-2 text-muted">{item.kind}</span>
              </span>
              <span className="text-muted">{item.days === 0 ? "Today" : item.label}</span>
            </li>
          ))}
        </ul>
      </section>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-1 py-4 sm:grid-cols-4 sm:items-baseline">
            <Link to="/admin/circles/$id" params={{ id: row.id }} className="font-medium text-fg">
              {row.name}
            </Link>
            <p className="text-sm text-muted">{row.city}</p>
            <p className="text-sm text-fg">
              {row.taken} / {row.capacity}
            </p>
            <p className="text-sm text-muted">
              Kitty ₹{Number(row.kitty_amount).toLocaleString("en-IN")} · Join ₹{Number(row.joining_fee).toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-fg sm:col-span-4">
              {row.members.length === 0 ? (
                "No one in this Circle yet."
              ) : (
                <span className="flex flex-wrap gap-x-4 gap-y-2">
                  {row.members.map((member) => (
                    <span key={member.id}>
                      {member.host_label ? <span className="mr-2 text-muted">{member.host_label}</span> : null}
                      <button type="button" className="underline" onClick={() => void receive(row.id, member.id)}>
                          {member.name}
                        </button>
                      <PaidMark paid={member.paid} />
                    </span>
                  ))}
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}