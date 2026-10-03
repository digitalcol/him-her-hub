import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms · Him·Her·Hub" }] }),
  component: Terms,
});

function Terms() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Terms</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Terms</h1>
      <div className="mt-8 max-w-xl space-y-4 text-base text-pretty text-soft">
        <p>Membership is by application. Sending a note does not reserve a place in a Circle.</p>
        <p>Circles stay small. We review each couple and open a Circle only when a group belongs together.</p>
        <p>The public site is for introductions. What happens inside a Circle stays with that Circle.</p>
      </div>
    </main>
  );
}
