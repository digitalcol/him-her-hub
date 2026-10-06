import { Link } from "@tanstack/react-router";

export function ReviewPortrait({
  label,
  src,
  id,
  href,
  attention = false,
}: {
  label: string;
  src?: string;
  id?: string;
  href?: string;
  attention?: boolean;
}) {
  const ring = attention ? "ring-2 ring-[#ee2a7b]" : "ring-1 ring-line";
  const together = label === "Together";
  const body = (
    <span className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
      <span className={`relative block size-[4.75rem] overflow-hidden rounded-full bg-line ${ring}`}>
        {src ? (
          <img
            src={src}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{
              objectPosition: together ? "center 32%" : "center 16%",
              transform: together ? "scale(1.35)" : "scale(1.7)",
              transformOrigin: together ? "center 32%" : "center 16%",
            }}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm font-medium text-muted">{label.slice(0, 1)}</span>
        )}
      </span>
      <span className="w-full truncate text-center text-xs text-fg">{label}</span>
    </span>
  );
  if (href) {
    return (
      <a href={href} className="shrink-0">
        {body}
      </a>
    );
  }
  if (!id) return body;
  return (
    <Link to="/admin/applications/$id" params={{ id }} className="shrink-0">
      {body}
    </Link>
  );
}
