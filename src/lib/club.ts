export const WORDMARK = "HIM·HER·HUB.";
export const IG_URL = "https://www.instagram.com/thehimherhub/";
export const IG_HANDLE = "@thehimherhub";

const files = import.meta.glob("../assets/moments/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const alts: Record<string, string> = {
  "post-1.jpg": "A couple in wedding clothes, the woman laughing in gold jewellery.",
  "post-2.jpg": "A man in a cream turban and embroidered jacket, hands pressed together.",
  "post-3.jpg": "A couple on a stage, she in green, he in a silver jacket.",
};

const links: Record<string, string> = {
  "post-1.jpg": "https://www.instagram.com/p/DeEJJTDjJud/",
  "post-2.jpg": "https://www.instagram.com/reel/DeEK2l3zxhN/",
  "post-3.jpg": "https://www.instagram.com/reel/DeELGiYzDoQ/",
};

export const moments = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => {
    const name = path.split("/").pop() ?? "moment";
    return { src, alt: alts[name] ?? "A moment from Him Her Hub", href: links[name] ?? IG_URL };
  });
