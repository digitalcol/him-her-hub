import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { IG_URL, moments } from "@/lib/club";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Him·Her·Hub — Private Social Circles for Couples in Bangalore" }],
  }),
  component: Home,
});

const PATHS = [
  {
    k: "01",
    label: "THE CIRCLE",
    title: "Ten couples. One Circle.",
    body: "Small on purpose.",
    to: "/circle",
    cta: "Explore the Circle",
  },
  {
    k: "02",
    label: "MOMENTS",
    title: "See what we've been up to.",
    body: "Dinners, trips, evenings and everything in between.",
    to: "/moments",
    cta: "See all moments",
  },
  {
    k: "03",
    label: "APPLY",
    title: "Find your Circle.",
    body: "Tell us a little about the two of you.",
    to: "/apply",
    cta: "Apply together",
  },
] as const;

function Home() {
  const [open, setOpen] = useState<number | null>(null);
  const laneA = moments.filter((_, index) => index % 2 === 0);
  const laneB = moments.filter((_, index) => index % 2 === 1);

  return (
    <main className="flex flex-col px-6 pt-6 pb-8 lg:h-[calc(100svh-5rem)] lg:px-10 lg:pt-6 lg:pb-6">
      <div className="home-stage">
        <div className="flex flex-col">
          <h1 className="text-mark text-fg">
            <span className="sr-only">Him·Her·Hub</span>
            <span aria-hidden="true" className="block">
              HIM
            </span>
            <span aria-hidden="true" className="block">
              HER
            </span>
            <span aria-hidden="true" className="block">
              HUB
            </span>
          </h1>
          <p className="mt-6 max-w-md text-3xl font-semibold tracking-tight text-balance text-fg lg:text-4xl">
            GOOD FRIENDS
            <br />
            ARE HARD TO FIND.
          </p>
          <p className="mt-4 text-sm text-soft">A private social club for couples.</p>
          <p className="mt-1 text-[13px] text-muted">Bangalore, India</p>
          <div className="mt-8 grid gap-8 border-t border-line pt-6 sm:grid-cols-3 lg:mt-auto">
            {PATHS.map((path) => (
              <div key={path.to}>
                <p className="text-xs tracking-index text-muted uppercase">
                  {path.k}
                  <span className="px-2">/</span>
                  {path.label}
                </p>
                <p className="mt-3 text-lg font-medium tracking-tight text-pretty text-fg">{path.title}</p>
                <p className="mt-2 text-sm text-pretty text-muted">{path.body}</p>
                <Link to={path.to} className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-fg">
                  {path.cta}
                  <ArrowUpRight className="size-4 text-accent" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="media-lanes mt-8 overflow-hidden lg:mt-0 lg:h-full">
          <div className="flex gap-3 overflow-x-auto lg:h-full lg:overflow-hidden">
            <Lane items={laneA} className="lane-up" onOpen={setOpen} offset={0} />
            <Lane items={laneB} className="lane-down" onOpen={setOpen} offset={1} />
          </div>
        </div>
      </div>
      {open !== null ? (
        <dialog open className="fixed inset-0 z-50 flex items-center justify-center bg-fg/80 p-6" onClick={() => setOpen(null)}>
          <div className="max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <img src={moments[open].src} alt={moments[open].alt} className="max-h-[70vh] w-full object-contain" />
            <div className="mt-3 flex items-center justify-between text-sm text-bg">
              <button type="button" className="h-11 px-2" onClick={() => setOpen((open + moments.length - 1) % moments.length)}>
                Previous
              </button>
              <a href={IG_URL} className="underline" target="_blank" rel="noreferrer">
                View on Instagram
              </a>
              <button type="button" className="h-11 px-2" onClick={() => setOpen((open + 1) % moments.length)}>
                Next
              </button>
            </div>
            <button type="button" className="mt-2 h-11 text-sm text-bg" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </dialog>
      ) : null}
    </main>
  );
}

function Lane({
  items,
  className,
  onOpen,
  offset,
}: {
  items: typeof moments;
  className: string;
  onOpen: (index: number) => void;
  offset: number;
}) {
  const loop = [...items, ...items];
  return (
    <div className="w-40 shrink-0 lg:w-1/2">
      <div className={`lane-track ${className}`}>
        {loop.map((item, index) => (
          <button key={`${item.src}-${index}`} type="button" className="block w-full" onClick={() => onOpen((index % items.length) * 2 + offset)}>
            <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
