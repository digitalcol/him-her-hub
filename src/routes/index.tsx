import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

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
    label: "WAITLIST",
    title: "Join the waitlist.",
    body: "Tell us a little about the two of you.",
    to: "/apply",
    cta: "Join the waitlist",
  },
] as const;

function Home() {
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
          <div className="primary-pathways mt-6 grid border-t border-line lg:mt-auto lg:grid-cols-2 lg:gap-8 lg:pt-6">
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
      </div>
    </main>
  );
}
