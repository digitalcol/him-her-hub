import { createServerFn } from "@tanstack/react-start";

export const memberOpen = createServerFn({ method: "GET" }).handler(async () => {
  const { memberCoupleId } = await import("@/lib/member-session.server");
  return memberCoupleId() !== null;
});

export const signInMember = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const username = data.username.trim().toLowerCase();
    const password = data.password;
    if (!username || !password) throw new Error("Enter the username and password.");
    const { getSql } = await import("@/lib/db");
    const { checkPassword } = await import("@/lib/couple-login.server");
    const { openMember } = await import("@/lib/member-session.server");
    const sql = await getSql();
    const rows = await sql<{ couple_id: string; password_hash: string }>`
      select l.couple_id, l.password_hash
      from couple_logins l
      join circle_memberships m on m.couple_id = l.couple_id and m.status = 'ACTIVE'
      where l.username = ${username}
      limit 1
    `;
    if (!rows[0] || !checkPassword(password, rows[0].password_hash)) {
      throw new Error("That username or password is not right.");
    }
    openMember(rows[0].couple_id);
    return { ok: true };
  });

export const changeOwnPassword = createServerFn({ method: "POST" })
  .validator((data: { current: string; next: string }) => data)
  .handler(async ({ data }) => {
    const next = data.next.trim();
    if (next.length < 4 || next.length > 80) throw new Error("The new password needs at least 4 characters.");
    const { memberCoupleId } = await import("@/lib/member-session.server");
    const coupleId = memberCoupleId();
    if (!coupleId) throw new Error("Sign in again.");
    const { getSql } = await import("@/lib/db");
    const { checkPassword, hashPassword, sealPassword } = await import("@/lib/couple-login.server");
    const sql = await getSql();
    const rows = await sql<{ password_hash: string }>`select password_hash from couple_logins where couple_id = ${coupleId}`;
    if (!rows[0] || !checkPassword(data.current, rows[0].password_hash)) throw new Error("The current password is not right.");
    await sql`update couple_logins set password_hash = ${hashPassword(next)}, password_sealed = ${sealPassword(next)} where couple_id = ${coupleId}`;
    return { ok: true };
  });

export const lockMember = createServerFn({ method: "POST" }).handler(async () => {
  const { closeMember } = await import("@/lib/member-session.server");
  closeMember();
  return { ok: true };
});
