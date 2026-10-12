import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY = scryptSync("hhh-couple-login-v1", "himherhub", 32);

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(".");
  if (!salt || !hash) return false;
  const next = scryptSync(password, Buffer.from(salt, "base64url"), 32);
  const left = Buffer.from(hash, "base64url");
  if (left.length !== next.length || !timingSafeEqual(left, next)) return false;
  return true;
}

export function sealPassword(password: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function openPassword(sealed: string) {
  const [iv, tag, enc] = sealed.split(".");
  if (!iv || !tag || !enc) return "";
  try {
    const decipher = createDecipheriv("aes-256-gcm", KEY, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(enc, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
