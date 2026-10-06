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
  const body = (
    <span className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
      <span className={`relative block size-[4.75rem] overflow-hidden rounded-full bg-bg ${ring}`}>
        {src ? (
          <img src={src} alt="" className="absolute inset-0 size-full object-cover object-[center_30%]" />
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
