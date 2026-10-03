import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { IG_HANDLE, IG_URL, moments } from "@/lib/club";

export const Route = createFileRoute("/moments")({
  head: () => ({ meta: [{ title: "Moments · Him·Her·Hub" }] }),
  component: Moments,
});

function Moments() {
  return (
    <main className="px-6 py-14 lg:px-12">
      <p className="text-xs tracking-index text-muted uppercase">Moments</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight text-balance text-fg">
        THIS IS WHAT
        <br />
        IT LOOKS LIKE.
      </h1>
      <a
        href={IG_URL}
        className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg"
        target="_blank"
        rel="noreferrer"
      >
        {IG_HANDLE}
        <ArrowUpRight
          className="size-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </a>
      <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {moments.map((moment) => (
          <li key={moment.src}>
            <img src={moment.src} alt={moment.alt} className="w-full" />
          </li>
        ))}
      </ul>
    </main>
  );
}
