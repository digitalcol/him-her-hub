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
        <p>Him·Her·Hub is a private club. We only ask for what we need to read an application.</p>
        <p>
          The public application form does not send your details to a server. What you type stays in this
          browser session.
        </p>
        <p>We do not sell member information, and we do not publish who is in a Circle.</p>
      </div>
    </main>
  );
}
