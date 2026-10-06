import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/circle")({
  head: () => ({ meta: [{ title: "The club · Him·Her·Hub" }] }),
  component: Circle,
});

function Circle() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <div>
        <p className="text-xs tracking-index text-muted uppercase">The club</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">
          A PRIVATE
          <br />
          SOCIAL CLUB.
        </h1>
        <p className="mt-4 text-lg text-fg">For couples in Bangalore.</p>
        <div className="mt-8 max-w-xl space-y-4 text-base text-pretty text-soft">
          <p>If you would like to be invited, join the waitlist.</p>
          <p>Tell us a little about the two of you. We read every note.</p>
          <p>If there is a place for you, we will be in touch.</p>
        </div>
        <Link to="/apply" search={{ for: "" }} className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-fg">
          Join the waitlist
          <ArrowUpRight
            className="size-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </main>
  );
}
