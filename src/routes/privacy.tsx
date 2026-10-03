import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy · Him·Her·Hub" }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Privacy</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Privacy</h1>
      <div className="mt-8 max-w-xl space-y-4 text-base text-pretty text-soft">
        <p>Him·Her·Hub is a private club. We only ask for what we need to read a waitlist note.</p>
        <p>Photographs and contact details are kept private. They are not shown on the public site.</p>
        <p>We do not sell member information, and we do not publish who has been invited.</p>
      </div>
    </main>
  );
}
