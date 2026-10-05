export const WORDMARK = "HIM·HER·HUB.";
export const IG_URL = "https://www.instagram.com/thehimherhub/";
export const IG_HANDLE = "@thehimherhub";

const files = import.meta.glob("../assets/moments/*.{jpg,jpeg,png,webp,heic,HEIC,heif,HEIF}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const alts: Record<string, string> = {
  "post-1.jpg": "Two people at a restaurant table, one lifting a fork.",
  "post-2.jpg": "Two people seated at a dinner table with plates and glasses.",
  "post-3.jpg": "Three people at a restaurant table, one mid-gesture.",
  "post-4.jpg": "Two people seated together in a restaurant booth.",
  "post-5.jpg": "A group at a table with their hands raised.",
  "post-6.jpg": "Two people standing close together outdoors.",
  "post-7.jpg": "Two people posing together outdoors.",
  "post-8.jpg": "Two people standing together outdoors at night.",
  "post-9.jpg": "A couple in wedding clothes, the woman laughing in gold jewellery.",
  "post-10.jpg": "A man in a cream turban and embroidered jacket, hands pressed together.",
  "post-11.jpg": "A couple on a stage, she in green, he in a silver jacket.",
};

export const moments = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => {
    const name = path.split("/").pop() ?? "moment";
    return { src, alt: alts[name] ?? "A moment from Him Her Hub" };
  });
