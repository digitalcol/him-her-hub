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
  const ring = attention
    ? "bg-[conic-gradient(from_210deg,#f9ce34,#f77737,#ee2a7b,#8134af,#f9ce34)]"
    : "bg-line";
  const body = (
    <span className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
      <span className={`relative grid size-[4.75rem] place-items-center rounded-full p-[3px] ${ring}`}>
        <span className="relative block size-full overflow-hidden rounded-full bg-bg">
          {src ? (
            <img
              src={src}
              alt=""
              className="absolute top-1/2 left-1/2 rounded-full object-cover object-[center_20%]"
              style={{ width: "76%", height: "76%", transform: "translate(-50%, -50%)" }}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm font-medium text-muted">{label.slice(0, 1)}</span>
          )}
        </span>
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
