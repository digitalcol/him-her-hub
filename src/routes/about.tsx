import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · Him·Her·Hub" }] }),
  component: About,
});

function About() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">About</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">
        GOOD FRIENDS
        <br />
        ARE HARD TO FIND.
      </h1>
      <div className="mt-8 max-w-xl space-y-4 text-base text-pretty text-soft">
        <p>Him·Her·Hub brings couples together in small private Circles in Bangalore.</p>
        <p>
          We keep them small deliberately. Every application is reviewed, and when we think a group belongs
          together, we open the Circle.
        </p>
        <p>The rest happens in real life.</p>
      </div>
      <Link to="/apply" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-fg">
        Apply together
        <ArrowUpRight
          className="size-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </Link>
    </main>
  );
}
