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
        <p>Membership is by invitation. Joining the waitlist does not reserve a place.</p>
        <p>We read every note. If there is a place for the two of you, we will be in touch.</p>
        <p>The public site is an introduction. What happens among members stays private.</p>
      </div>
    </main>
  );
}
