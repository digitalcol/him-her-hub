import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PaidMark } from "@/components/kitty-statement";
import { comingUp, listCircles, markKittyPaid, setCoupleLogin } from "@/lib/club-api";

export const Route = createFileRoute("/admin/circles/")({
  head: () => ({ meta: [{ title: "Circles · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => Promise.all([listCircles(), comingUp()]),
  component: Circles,
});

function Circles() {
  const [rows, dates] = Route.useLoaderData();
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);

  async function receive(circleId: string, coupleId: string) {
    await markKittyPaid({ data: { circleId, coupleId } });
    await router.invalidate();
  }

  async function saveLogin(event: FormEvent<HTMLFormElement>, coupleId: string) {
    event.preventDefault();
    setNote(null);
    const form = new FormData(event.currentTarget);
    try {
      await setCoupleLogin({
        data: {
          coupleId,
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      });
      setNote("Saved.");
      await router.invalidate();
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not save that login.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Circles.</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">Tap a name when the kitty has come in. Tap it again if that was a mistake. The username and password for each couple are under the Circle.</p>
      {note ? <p className="mt-3 text-sm text-soft">{note}</p> : null}
      <Link to="/admin/circles/new" className="mt-6 inline-flex h-11 items-center text-sm font-medium text-fg">
        New Circle
      </Link>
      <section className="mt-10">
        <p className="text-xs tracking-index text-muted uppercase">Coming up</p>
        <p className="mt-3 text-sm text-muted">
          {dates.items.filter((item) => item.kind === "Birthday").length} birthdays · {dates.items.filter((item) => item.kind === "Anniversary").length} anniversaries
        </p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {dates.items.map((item) => (
            <li key={`${item.kind}-${item.name}-${item.label}`} className="flex items-baseline justify-between gap-6 py-3 text-sm">
              <span className="text-fg">
                {item.name}
                <span className="ml-2 text-muted">{item.kind}</span>
              </span>
              <span className="shrink-0 text-muted">{item.days === 0 ? "Today" : item.label}</span>
            </li>
          ))}
        </ul>
        {dates.missing.length > 0 ? (
          <>
            <p className="mt-8 text-xs tracking-index text-muted uppercase">Missing or not readable</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {dates.missing.map((item) => (
                <li key={`${item.name}-${item.problem}`} className="flex items-baseline justify-between gap-6 py-3 text-sm">
                  <span className="text-fg">{item.name}</span>
                  <span className="shrink-0 text-[#b42318]">{item.problem}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
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
            <div className="sm:col-span-4">
              <p className="mt-4 text-xs tracking-index text-muted uppercase">Username and password</p>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {row.members.map((member) => (
                  <li key={member.id} className="py-3">
                    <form
                      key={`${member.id}-${member.login?.username ?? ""}-${member.login?.password ?? ""}`}
                      className="flex flex-wrap items-center gap-3"
                      onSubmit={(event) => void saveLogin(event, member.id)}
                    >
                      <span className="w-full text-sm text-fg sm:w-64">{member.name}</span>
                      <input
                        name="username"
                        defaultValue={member.login?.username ?? ""}
                        placeholder="Username"
                        autoComplete="off"
                        className="w-40 border border-line bg-bg px-3 py-2 text-sm text-fg"
                      />
                      <input
                        name="password"
                        defaultValue={member.login?.password ?? ""}
                        placeholder="Password"
                        autoComplete="off"
                        className="w-40 border border-line bg-bg px-3 py-2 text-sm text-fg"
                      />
                      <button type="submit" className="h-10 px-2 text-sm font-medium text-fg">
                        Save
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}