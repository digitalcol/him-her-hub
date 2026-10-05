import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { circleNameChoices, createCircle } from "@/lib/club-api";

export const Route = createFileRoute("/admin/circles/new")({
  head: () => ({ meta: [{ title: "New Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => circleNameChoices(),
  component: NewCircle,
});

function NewCircle() {
  const names = Route.useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const created = await createCircle({
        data: {
          name: String(form.get("name") ?? ""),
          rules: String(form.get("rules") ?? ""),
          kittyAmount: Number(form.get("kitty")),
          joiningFee: Number(form.get("joining")),
          renewalFee: Number(form.get("renewal")),
        },
      });
      await navigate({ to: "/admin/circles/$id", params: { id: created.id } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The Circle could not be opened.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">New Circle.</h1>
      <p className="mt-4 max-w-xl text-sm text-pretty text-muted">
        Names come from one family of stars, the same line as Orion and Vega. A name is used once. Set the rules and the fees before anyone is allotted.
      </p>
      <form className="mt-10 max-w-xl space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-fg">
          Name
          <select className="mt-2 w-full border border-line bg-bg px-3 py-3" name="name" required defaultValue={names[0] ?? ""}>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-fg">
          Rules
          <textarea className="mt-2 min-h-28 w-full border border-line bg-bg px-3 py-3" name="rules" required placeholder="How this Circle meets, pays, and hosts." />
        </label>
        <Money label="Kitty contribution" name="kitty" />
        <Money label="Joining fee" name="joining" min={0} />
        <Money label="Annual renewal" name="renewal" min={0} />
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-5 text-sm font-medium text-bg">
          Open this Circle
        </button>
      </form>
    </main>
  );
}

function Money({ label, name, min = 1 }: { label: string; name: string; min?: number }) {
  return (
    <label className="block text-sm text-fg">
      {label}
      <input className="mt-2 w-full border border-line bg-bg px-3 py-3" name={name} type="number" min={min} step={1} required />
    </label>
  );
}
