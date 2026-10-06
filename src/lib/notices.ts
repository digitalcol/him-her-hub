import { createServerFn } from "@tanstack/react-start";

const REPLIES = ["coming", "available", "not-available", "not-coming"] as const;

async function db() {
  const { getSql } = await import("@/lib/db");
  const { actorForRequest, canMutateOperations } = await import("@/lib/club-access");
  const { operationsUnlocked } = await import("@/lib/operations-lock.server");
  return { sql: await getSql(), actor: actorForRequest(), canMutateOperations, operationsUnlocked };
}

export const sendNotice = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; title: string; body: string }) => data)
  .handler(async ({ data }) => {
    const { sql, actor, canMutateOperations, operationsUnlocked } = await db();
    if (!operationsUnlocked() || !canMutateOperations(actor)) throw new Error("Operations is locked.");
    const title = data.title.trim();
    const body = data.body.trim();
    if (!title || !body) throw new Error("A notice needs a title and a message.");
    const circleId = data.circleId === "all" ? null : data.circleId;
    if (circleId) {
      const found = await sql<{ id: string }>`select id from circles where id = ${circleId}`;
      if (!found[0]) throw new Error("That Circle does not exist.");
    }
    await sql`insert into notices (id, circle_id, title, body) values (${crypto.randomUUID()}, ${circleId}, ${title}, ${body})`;
    return { ok: true };
  });

export const listNotices = createServerFn({ method: "GET" }).handler(async () => {
  const { sql, operationsUnlocked, actor, canMutateOperations } = await db();
  if (!operationsUnlocked() || !canMutateOperations(actor)) throw new Error("Operations is locked.");
  return sql<{ id: string; title: string; body: string; circle_id: string | null; circle_name: string | null }>`
    select n.id, n.title, n.body, n.circle_id, c.name as circle_name
    from notices n
    left join circles c on c.id = n.circle_id
    order by n.created_at desc
  `;
});

export const proposeDate = createServerFn({ method: "POST" })
  .validator((data: { title: string; place: string; eventDate: string }) => data)
  .handler(async ({ data }) => {
    const { sql, actor } = await db();
    if (actor.role === "anonymous") throw new Error("Not allowed.");
    const title = data.title.trim();
    const place = data.place.trim();
    if (!title || !place || !data.eventDate) throw new Error("A date needs a title, a place, and a day.");
    const seated = await sql<{ circle_id: string }>`
      select circle_id from circle_memberships where couple_id = 'c1' and status = 'ACTIVE' limit 1
    `;
    const circleId = seated[0]?.circle_id;
    if (!circleId) throw new Error("No Circle is assigned yet.");
    await sql`insert into events (id, circle_id, title, place, event_date, host_couple_id, status)
      values (${crypto.randomUUID()}, ${circleId}, ${title}, ${place}, ${data.eventDate}, 'c1', 'PROPOSED')`;
    return { ok: true };
  });

export const setReply = createServerFn({ method: "POST" })
  .validator((data: { eventId: string; choice: string }) => data)
  .handler(async ({ data }) => {
    const { sql, actor } = await db();
    if (actor.role === "anonymous") throw new Error("Not allowed.");
    if (!REPLIES.includes(data.choice as (typeof REPLIES)[number])) throw new Error("Choose a reply.");
    const event = await sql<{ id: string }>`select id from events where id = ${data.eventId}`;
    if (!event[0]) throw new Error("That date was not found.");
    const available = data.choice === "coming" || data.choice === "available";
    await sql`insert into availability (event_id, couple_id, available, choice)
      values (${data.eventId}, 'c1', ${available}, ${data.choice})
      on conflict (event_id, couple_id) do update set available = ${available}, choice = ${data.choice}`;
    return { ok: true };
  });
