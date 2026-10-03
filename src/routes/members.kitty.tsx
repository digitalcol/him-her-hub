import { createFileRoute } from "@tanstack/react-router";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/members/kitty")({
  head: () => ({ meta: [{ title: "Kitty · Members · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberKitty,
});

function MemberKitty() {
  const { circle, funding } = Route.useLoaderData();
  const spent = circle.ledger
    .filter((row) => row.kind === "EXPENSE")
    .reduce((sum, row) => sum + row.amount, 0);
  const expenses = circle.ledger.filter((row) => row.kind === "EXPENSE");
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.name} kitty</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">₹{circle.kitty.toLocaleString("en-IN")}</h1>
      <p className="mt-2 text-sm text-muted">remaining · spent ₹{spent.toLocaleString("en-IN")}</p>
      <p className="mt-6 text-sm text-fg">Your contribution: {funding.yours}</p>
      <p className="mt-1 text-sm text-muted">
        {funding.paid} / {funding.seats} contributions complete
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {expenses.map((row) => (
          <li key={row.note + row.amount} className="flex justify-between py-3 text-sm">
            <span className="text-fg">{row.note}</span>
            <span className="text-muted">− ₹{row.amount.toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
