import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KittyStatement } from "@/components/kitty-statement";
import { addExpense, getCircle, listCircles, markKittyPaid } from "@/lib/club.server";

export const Route = createFileRoute("/admin/kitty")({
  validateSearch: (search: Record<string, unknown>): { circle: string } => ({
    circle: typeof search.circle === "string" ? search.circle : "",
  }),
  loaderDeps: ({ search }) => ({ circle: search.circle }),
  head: () => ({ meta: [{ title: "Kitty · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: async ({ deps }) => {
    const circles = await listCircles();
    const chosen = circles.find((row) => row.id === deps.circle) ?? circles[0];
    if (!chosen) throw new Error("No Circle yet.");
    return { circles, circle: await getCircle({ data: { id: chosen.id } }) };
  },
  component: AdminKitty,
});

function AdminKitty() {
  const { circles, circle } = Route.useLoaderData();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const file = new FormData(event.currentTarget).get("bill");
    try {
      if (!(file instanceof File) || file.size === 0) throw new Error("Upload the bill.");
      const bill = await readBill(file);
      await addExpense({ data: { circleId: circle.id, amount: Number(amount), note, bill } });
      setNote("");
      setAmount("");
      event.currentTarget.reset();
      await router.invalidate();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The bill could not be added.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Kitty.</h1>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {circles.map((row) => (
          <Link key={row.id} to="/admin/kitty" search={{ circle: row.id }} className={row.id === circle.id ? "font-semibold text-fg" : "text-muted"}>
            {row.name}
          </Link>
        ))}
      </div>
      <KittyStatement
        circle={circle}
        onPaid={async (coupleId) => {
          await markKittyPaid({ data: { circleId: circle.id, coupleId } });
          await router.invalidate();
        }}
      />
      <form className="mt-10 space-y-4 border-t border-line pt-8" onSubmit={onAdd}>
        <p className="text-xs tracking-index text-muted uppercase">Add a bill</p>
        <label className="block text-sm text-fg">
          Event
          <input className="mt-2 block w-full border border-line bg-bg px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} required />
        </label>
        <label className="block text-sm text-fg">
          Amount spent
          <input className="mt-2 block w-40 border border-line bg-bg px-3 py-3" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </label>
        <label className="block text-sm text-fg">
          Bill
          <input className="mt-2 block w-full text-sm" name="bill" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
          Add to the kitty
        </button>
      </form>
    </main>
  );
}

function readBill(file: File) {
  if (file.size > 6 * 1024 * 1024) throw new Error("The bill must be under 6 MB.");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That bill could not be read."));
    reader.readAsDataURL(file);
  });
}
