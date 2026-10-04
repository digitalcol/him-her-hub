import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { moments } from "@/lib/club";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Him·Her·Hub — A private social club for couples in Bangalore" }],
  }),
  component: Home,
});

const PATHS = [
  {
    k: "01",
    label: "THE CLUB",
    title: "A private social club.",
    body: "For couples in Bangalore.",
    to: "/about",
    cta: "About the club",
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
    label: "WAITLIST",
    title: "Join the waitlist.",
    body: "Tell us a little about the two of you.",
    to: "/apply",
    cta: "Join the waitlist",
  },
] as const;

function Home() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key !== "Tab") return;
      const dialog = closeRef.current?.closest("[role=dialog]");
      const items = dialog?.querySelectorAll<HTMLElement>("button, a");
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const laneA = moments.filter((_, index) => index % 2 === 0);
  const laneB = moments.filter((_, index) => index % 2 === 1);

  return (
    <main className="flex flex-col px-6 pt-5 pb-8 lg:h-[calc(100svh-5rem)] lg:px-10 lg:pt-0 lg:pb-6">
      <div className="home-stage">
        <div className="left-panel flex flex-col lg:h-full lg:min-h-0">
          <div className="brand-content">
            <h1 className="hero-brand-line text-fg">
              <span className="sr-only">Him·Her·Hub</span>
              <span aria-hidden="true" className="hero-brand-split">
                HIM
                <br />
                HER
                <br />
                HUB
              </span>
              <span aria-hidden="true" className="hero-brand-single">
                HIM HER HUB
              </span>
            </h1>
            <p className="brand-proposition font-semibold tracking-tight text-balance text-fg">
              GOOD FRIENDS
              <br />
              ARE HARD TO FIND.
            </p>
            <p className="brand-club text-sm text-soft">A private social club for couples.</p>
            <p className="brand-city text-[13px] text-muted">Bangalore, India</p>
          </div>
          <div className="mobile-film -mx-6 mt-6 overflow-hidden lg:hidden">
            <div className="film-track flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-2 pr-2" aria-hidden={copy === 1}>
                  {moments.map((item, index) => (
                    <button key={`${item.src}-${copy}`} type="button" className="w-[46vw] max-w-52 shrink-0" onClick={() => setOpen(index)}>
                      <img src={item.src} alt={copy === 0 ? item.alt : ""} width={640} height={800} loading={index < 2 && copy === 0 ? "eager" : "lazy"} className="aspect-[4/5] w-full object-cover" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="primary-pathways mt-6 grid border-t border-line lg:mt-auto lg:grid-cols-3 lg:gap-8 lg:pt-6">
            {PATHS.map((path) => (
              <div key={path.to} className="border-b border-line py-4 lg:border-0 lg:py-0">
                <p className="text-xs tracking-index text-muted uppercase">
                  {path.k}
                  <span className="px-2">/</span>
                  {path.label}
                </p>
                <p className="mt-1 text-base font-medium tracking-tight text-pretty text-fg lg:mt-3 lg:text-lg">{path.title}</p>
                <p className="mt-1 text-sm text-pretty text-muted lg:mt-2">{path.body}</p>
                <Link to={path.to} className="group mt-2 inline-flex items-center gap-2 text-sm font-medium text-fg lg:mt-4">
                  {path.cta}
                  <ArrowUpRight className="size-4 text-accent" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="media-lanes mt-8 hidden overflow-hidden lg:mt-0 lg:block lg:h-full">
          <div className="flex gap-3 overflow-x-auto lg:h-full lg:overflow-hidden">
            <Lane items={laneA} className="lane-up" onOpen={setOpen} offset={0} />
            <Lane items={laneB} className="lane-down" onOpen={setOpen} offset={1} />
          </div>
        </div>
      </div>
      {open !== null ? (
        <dialog open role="dialog" aria-modal="true" aria-label="Moment" className="fixed inset-0 z-50 flex items-center justify-center bg-fg/80 p-6" onClick={() => setOpen(null)}>
          <div className="max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <img src={moments[open].src} alt={moments[open].alt} className="max-h-[70vh] w-full object-contain" />
            <div className="mt-3 flex items-center justify-between text-sm text-bg">
              <button type="button" className="h-11 px-2" onClick={() => setOpen((open + moments.length - 1) % moments.length)}>
                Previous
              </button>
              <a href={moments[open].href} className="underline" target="_blank" rel="noreferrer">
                View on Instagram
              </a>
              <button type="button" className="h-11 px-2" onClick={() => setOpen((open + 1) % moments.length)}>
                Next
              </button>
            </div>
            <button ref={closeRef} type="button" className="mt-2 h-11 text-sm text-bg" onClick={() => setOpen(null)}>
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
            <img src={item.src} alt={item.alt} width={800} height={800} loading={index < 2 ? "eager" : "lazy"} className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
