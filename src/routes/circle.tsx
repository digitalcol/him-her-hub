import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/circle")({
  head: () => ({ meta: [{ title: "The Circle · Him·Her·Hub" }] }),
  component: Circle,
});

function Circle() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <div>
        <p className="text-xs tracking-index text-muted uppercase">The Circle</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">
          TEN COUPLES.
          <br />
          ONE CIRCLE.
        </h1>
        <p className="mt-4 text-lg text-fg">Small on purpose.</p>
        <div className="mt-8 max-w-xl space-y-4 text-base text-pretty text-soft">
          <p>We bring together small groups of couples we think will genuinely enjoy knowing one another.</p>
          <p>Every Circle is intentionally small.</p>
          <p>Once your Circle is ready, you meet the other couples and take it from there.</p>
        </div>
        <Link to="/apply" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-fg">
          Apply together
          <ArrowUpRight
            className="size-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </main>
  );
}
