import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

const COOKIE = "hhh_member";
const SECRET = "hhh-member-circle-v1";

function sign(coupleId: string) {
  const mac = createHmac("sha256", SECRET).update(coupleId).digest("base64url");
  return `${coupleId}.${mac}`;
}

function cookieOptions() {
  const request = getRequest();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: request.url.startsWith("https:"),
  };
}

export function memberCoupleId() {
  const value = getCookie(COOKIE);
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const coupleId = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(coupleId).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  if (!/^[a-z0-9:-]{1,80}$/i.test(coupleId)) return null;
  return coupleId;
}

export function openMember(coupleId: string) {
  setCookie(COOKIE, sign(coupleId), { ...cookieOptions(), maxAge: 60 * 60 * 24 * 14 });
}

export function closeMember() {
  setCookie(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}
