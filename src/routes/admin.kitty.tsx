import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { addExpense, getCircle } from "@/lib/club.server";

export const Route = createFileRoute("/admin/kitty")({
  head: () => ({ meta: [{ title: "Kitty · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => getCircle({ data: { id: "orion" } }),
  component: AdminKitty,
});

function AdminKitty() {
  const circle = Route.useLoaderData();
  const router = useRouter();
  const [note, setNote] = useState("Dinner");
  const [amount, setAmount] = useState("2000");

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    await addExpense({ data: { circleId: circle.id, amount: Number(amount), note } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Orion kitty</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">₹{circle.kitty.toLocaleString("en-IN")}</h1>
      <p className="mt-3 text-sm text-muted">Remaining. Every movement is a ledger line.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {circle.ledger.map((row) => (
          <li key={row.note + row.amount} className="flex justify-between py-3 text-sm">
            <span className="text-fg">{row.note}</span>
            <span className="text-muted">
              {row.kind === "EXPENSE" ? "− " : ""}₹{row.amount.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
      <form className="mt-8 flex flex-wrap items-end gap-3" onSubmit={onAdd}>
        <label className="text-sm text-fg">
          Note
          <input className="mt-2 block border border-line bg-bg px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <label className="text-sm text-fg">
          Amount
          <input className="mt-2 block w-32 border border-line bg-bg px-3 py-3" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <button type="submit" className="h-11 bg-fg px-4 text-sm text-bg">
          Add expense
        </button>
      </form>
    </main>
  );
}
