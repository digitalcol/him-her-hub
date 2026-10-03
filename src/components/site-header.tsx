import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WORDMARK } from "@/lib/club";

const PUBLIC_LINKS = [
  { to: "/circle", label: "The Circle" },
  { to: "/moments", label: "Moments" },
  { to: "/apply", label: "Apply" },
  { to: "/about", label: "About" },
] as const;

const ADMIN_LINKS = [
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/circles", label: "Circles" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/kitty", label: "Kitty" },
  { to: "/admin/events", label: "Events" },
] as const;

const MEMBER_LINKS = [
  { to: "/members/circle", label: "Circle" },
  { to: "/members/people", label: "Members" },
  { to: "/members/calendar", label: "Calendar" },
  { to: "/members/kitty", label: "Kitty" },
] as const;

export function SiteHeader() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const zone = path.startsWith("/admin") ? "admin" : path.startsWith("/members") ? "members" : "public";
  const links = zone === "admin" ? ADMIN_LINKS : zone === "members" ? MEMBER_LINKS : PUBLIC_LINKS;
  const side = zone === "public" ? { to: "/members/circle" as const, label: "Members" } : { to: "/" as const, label: "Public" };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg">
      <div className="relative flex h-20 items-center justify-between px-5 lg:px-8">
        <Link to="/" className="text-sm font-bold tracking-tight text-fg sm:text-base" onClick={() => setOpen(false)}>
          {WORDMARK}
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-fg"
              aria-current={path === link.to ? "page" : undefined}
            >
              <span className={path === link.to ? "font-semibold" : "font-normal"}>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to={side.to}
            className="hidden h-11 items-center px-2 text-sm text-fg lg:inline-flex"
            aria-current={path === side.to ? "page" : undefined}
          >
            {side.label}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center px-2 text-sm tracking-index text-fg uppercase lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-menu" className="border-t border-line px-5 py-4 lg:hidden" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-3 text-2xl font-medium tracking-tight text-fg"
              aria-current={path === link.to ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={side.to}
            className="block py-3 text-2xl font-medium tracking-tight text-fg"
            aria-current={path === side.to ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {side.label}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
