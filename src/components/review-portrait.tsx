import { useState } from "react";
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
  const [focus, setFocus] = useState("center 42%");
  const [scale, setScale] = useState(label === "Together" ? 2.1 : 2.4);
  const body = (
    <span className="flex w-[4.75rem] shrink-0 flex-col items-center gap-2">
      <span className={`relative block size-[4.75rem] overflow-hidden rounded-full bg-line ${ring}`}>
        {src ? (
          <img
            src={src}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: focus, transform: `scale(${scale})`, transformOrigin: focus }}
            onLoad={(event) => {
              const next = faceFocus(event.currentTarget, label === "Together");
              if (!next) return;
              setFocus(next.focus);
              setScale(next.scale);
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

function faceFocus(image: HTMLImageElement, together: boolean) {
  const width = 40;
  const height = 60;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  let bestX = width / 2;
  let bestY = height * 0.42;
  let best = 0;
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let score = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const i = ((y + dy) * width + (x + dx)) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 90 && g > 35 && b > 20 && r > g && r > b && r - g > 12) score += 1;
        }
      }
      if (score > best) {
        best = score;
        bestX = x;
        bestY = y;
      }
    }
  }
  if (best < 6) return null;
  const x = Math.round((bestX / width) * 100);
  const y = Math.round((bestY / height) * 100);
  return { focus: `${x}% ${y}%`, scale: together ? 2.15 : 2.7 };
}
