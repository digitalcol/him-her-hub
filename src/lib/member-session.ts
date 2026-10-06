import { createServerFn } from "@tanstack/react-start";

export const memberOpen = createServerFn({ method: "GET" }).handler(async () => {
  const { memberCoupleId } = await import("@/lib/member-session.server");
  return memberCoupleId() !== null;
});

export const signInMember = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Enter the email from your form.");
    const { getSql } = await import("@/lib/db");
    const { openMember } = await import("@/lib/member-session.server");
    const sql = await getSql();
    const rows = await sql<{ couple_id: string }>`
      select p.couple_id
      from people p
      join circle_memberships m on m.couple_id = p.couple_id and m.status = 'ACTIVE'
      where lower(p.email) = ${email}
      limit 1
    `;
    if (!rows[0]) throw new Error("That email is not in a Circle yet.");
    openMember(rows[0].couple_id);
    return { ok: true };
  });

export const lockMember = createServerFn({ method: "POST" }).handler(async () => {
  const { closeMember } = await import("@/lib/member-session.server");
  closeMember();
  return { ok: true };
});
