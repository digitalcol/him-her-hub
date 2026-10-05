export const WORDMARK = "HIM·HER·HUB.";
export const IG_URL = "https://www.instagram.com/thehimherhub/";
export const IG_HANDLE = "@thehimherhub";

const files = import.meta.glob("../assets/moments/*.{jpg,jpeg,png,webp,heic,HEIC,heif,HEIF}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const moments = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => ({ src, alt: "A moment from Him Her Hub" }));
