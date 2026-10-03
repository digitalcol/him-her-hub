import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { actorForRequest, canMutateOperations, canReadCircle, isPreviewMode } from "@/lib/club-access";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { isWorkspacePreview } from "@/lib/env.server";
import {
  type AppStatus,
  type LedgerKind,
  balance,
  canAssign,
  canTransition,
  displayStatus,
  normalizeInstagram,
  normalizePhone,
} from "@/lib/club-domain";

function assertActor() {
  const actor = actorForRequest();
  if (actor.role === "anonymous") {
    throw new Error("Club tools are closed until member and admin sign-in is on.");
  }
  return actor;
}

const partner = z.object({
  first: z.string().trim().min(1).max(40),
  last: z.string().trim().min(1).max(40),
  dob: z.string().min(4),
  mobile: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(120),
  profession: z.string().trim().min(1).max(80),
  instagram: z.string().trim().max(80).optional().default(""),
});

const applicationInput = z.object({
  one: partner,
  two: partner,
  area: z.string().trim().min(1).max(80),
  anniversary: z.string().optional().default(""),
  referred: z.string().trim().max(80).optional().default(""),
  about: z.string().trim().min(1).max(600),
  interests: z.array(z.string()).max(12).default([]),
  organise: z.string().trim().max(280).optional().default(""),
  privacyConsent: z.literal(true),
  photoConsent: z.boolean(),
});

async function seed(sql: Sql) {
  if (!isPreviewMode() || dbSource !== "pglite") return;
  const existing = await sql<{ n: number }>`select count(*) as n from circles`;
  if (Number(existing[0]?.n) > 0) return;

  await sql`insert into circles (id, name, city, status, capacity, kitty_amount, whatsapp_url, start_date, description)
    values ('orion', 'Orion', 'Bangalore', 'ACTIVE', 10, 10000, null, '2026-10-12', 'The first Circle.')`;
  await sql`insert into circles (id, name, city, status, capacity, kitty_amount, whatsapp_url, description)
    values ('vega', 'Vega', 'Bangalore', 'FORMING', 10, 10000, null, 'A second Circle, still open.')`;

  const seated = [
    ["c1", "Asha & Nikhil", "Indiranagar", "Asha", "Nikhil", "Architect", "Editor"],
    ["c2", "Diya & Kabir", "Koramangala", "Diya", "Kabir", "Designer", "Cook"],
    ["c3", "Naina & Vivek", "Jayanagar", "Naina", "Vivek", "Doctor", "Musician"],
  ] as const;

  for (const [id, name, area, firstA, firstB, jobA, jobB] of seated) {
    await sql`insert into couples (id, name, area, about, interests, status, photo_consent)
      values (${id}, ${name}, ${area}, 'In Orion.', 'Dining, Travel', 'ASSIGNED', false)`;
    await sql`insert into people (id, couple_id, first_name, last_name, profession)
      values (${`${id}-a`}, ${id}, ${firstA}, '', ${jobA})`;
    await sql`insert into people (id, couple_id, first_name, last_name, profession)
      values (${`${id}-b`}, ${id}, ${firstB}, '', ${jobB})`;
    await sql`insert into circle_memberships (id, circle_id, couple_id, status) values (${`m-${id}`}, 'orion', ${id}, 'ACTIVE')`;
    await sql`insert into ledger (id, circle_id, kind, amount, note)
      values (${`pay-${id}`}, 'orion', 'CONTRIBUTION', 10000, ${name})`;
    await sql`insert into contributions (id, circle_id, couple_id, expected_amount, status, paid_at, recorded_by)
      values (${`con-${id}`}, 'orion', ${id}, 10000, 'PAID', now(), 'seed')`;
  }

  await sql`insert into couples (id, name, area, about, interests, referral, status, photo_consent)
    values ('wait', 'Leela & Sameer', 'Whitefield', 'Waiting for a Circle.', 'Live music, Food', 'Asha', 'WAITING_FOR_CIRCLE', true)`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession) values ('wait-a', 'wait', 'Leela', '', 'Writer')`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession) values ('wait-b', 'wait', 'Sameer', '', 'Engineer')`;

  await sql`insert into couples (id, name, area, about, interests, status, photo_consent)
    values ('new', 'Meera & Arjun', 'Indiranagar', 'Just applied.', 'Outdoors, Brunch', 'NEW', false)`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession) values ('new-a', 'new', 'Meera', '', 'Teacher')`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession) values ('new-b', 'new', 'Arjun', '', 'Photographer')`;

  await sql`insert into ledger (id, circle_id, kind, amount, note)
    values ('exp-1', 'orion', 'EXPENSE', 12400, 'The Long Table')`;
  await sql`insert into events (id, circle_id, title, place, event_date, host_couple_id)
    values ('e1', 'orion', 'Sunday lunch', 'Indiranagar', '2026-10-12', 'c1')`;
  await sql`insert into availability (event_id, couple_id, available) values ('e1', 'c1', true), ('e1', 'c2', true), ('e1', 'c3', false)`;
}

async function ready() {
  if (!isWorkspacePreview() && dbSource === "pglite") {
    throw new Error("A hosted DATABASE_URL is required outside the local sandbox.");
  }
  assertActor();
  const sql = await getSql();
  await seed(sql);
  if (isPreviewMode() && dbSource === "pglite") {
    await sql`insert into contributions (id, circle_id, couple_id, expected_amount, status, paid_at, recorded_by)
      select 'con-' || m.couple_id, m.circle_id, m.couple_id, c.kitty_amount, 'PAID', now(), 'seed'
      from circle_memberships m
      join circles c on c.id = m.circle_id
      where m.status = 'ACTIVE'
        and not exists (
          select 1 from contributions x where x.circle_id = m.circle_id and x.couple_id = m.couple_id
        )`;
  }
  await sql`update circles set whatsapp_url = null where whatsapp_url = ${"https://wa.me/"}`;
  return sql;
}

type CoupleRow = {
  id: string;
  name: string;
  area: string;
  about: string;
  interests: string;
  referral: string | null;
  status: AppStatus;
  assigned: boolean;
};

async function couples(sql: Sql): Promise<CoupleRow[]> {
  return sql<CoupleRow>`
    select c.id, c.name, c.area, c.about, c.interests, c.referral, c.status,
      exists(select 1 from circle_memberships m where m.couple_id = c.id) as assigned
    from couples c
    order by c.created_at desc
  `;
}

export const clubOverview = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const rows = await couples(sql);
  const circleRows = await sql<{ id: string; name: string; status: string; capacity: number; taken: number }>`
    select c.id, c.name, c.status, c.capacity, count(m.couple_id) as taken
    from circles c
    left join circle_memberships m on m.circle_id = c.id
    group by c.id
  `;
  return {
    applications: rows.length,
    waiting: rows.filter((row) => row.status === "APPROVED" && !row.assigned).length,
    circles: circleRows,
  };
});

export const listApplications = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const rows = await couples(sql);
  return rows.map((row) => ({
    ...row,
    label: displayStatus(row.status, row.assigned),
  }));
});

export const getApplication = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<CoupleRow>`
      select c.id, c.name, c.area, c.about, c.interests, c.referral, c.status,
        exists(select 1 from circle_memberships m where m.couple_id = c.id) as assigned
      from couples c where c.id = ${data.id}
    `;
    const couple = rows[0];
    if (!couple) throw new Error("Application not found.");
    const people = await sql<{ first_name: string; profession: string | null; instagram: string | null }>`
      select first_name, profession, instagram from people where couple_id = ${data.id}
    `;
    const notes = await sql<{ id: string; body: string }>`
      select id, body from admin_notes where couple_id = ${data.id} order by created_at
    `;
    return { ...couple, label: displayStatus(couple.status, couple.assigned), people, notes };
  });

export const setApplicationStatus = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: AppStatus }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<{ status: AppStatus }>`select status from couples where id = ${data.id}`;
    const current = rows[0]?.status;
    if (!current || !canTransition(current, data.status)) {
      throw new Error("That status change is not allowed.");
    }
    await sql`update couples set status = ${data.status}, reviewed_at = now(), updated_at = now() where id = ${data.id}`;
    return { ok: true };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .validator((data: unknown) => applicationInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await ready();
    const email = data.one.email.toLowerCase();
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const hits = await sql<{ hits: number }>`
      select hits from rate_limits where key = ${`apply:${email}`} and window_start > ${windowStart}
    `;
    if (Number(hits[0]?.hits ?? 0) >= 5) throw new Error("Too many applications from this email. Try again later.");
    await sql`insert into rate_limits (key, hits, window_start)
      values (${`apply:${email}`}, 1, now())
      on conflict (key) do update set
        hits = case when rate_limits.window_start < ${windowStart} then 1 else rate_limits.hits + 1 end,
        window_start = case when rate_limits.window_start < ${windowStart} then now() else rate_limits.window_start end
    `;
    const id = crypto.randomUUID();
    const name = `${data.one.first} & ${data.two.first}`;
    const interests = [...data.interests, data.organise].filter(Boolean).join(", ");
    await sql`insert into couples (id, name, area, about, interests, referral, status, photo_consent)
      values (${id}, ${name}, ${data.area}, ${data.about}, ${interests}, ${data.referred || null}, 'NEW', ${data.photoConsent})`;
    for (const [key, person] of [
      ["a", data.one],
      ["b", data.two],
    ] as const) {
      await sql`insert into people (id, couple_id, first_name, last_name, profession, instagram, phone)
        values (${`${id}-${key}`}, ${id}, ${person.first}, ${person.last}, ${person.profession}, ${normalizeInstagram(person.instagram)}, ${normalizePhone(person.mobile)})`;
    }
    return { id };
  });

export const listCircles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  return sql<{ id: string; name: string; city: string; status: string; capacity: number; kitty_amount: number; taken: number }>`
    select c.id, c.name, c.city, c.status, c.capacity, c.kitty_amount, count(m.couple_id) as taken
    from circles c
    left join circle_memberships m on m.circle_id = c.id
    group by c.id
    order by c.name
  `;
});

async function loadCircle(sql: Sql, id: string) {
  const circles = await sql<{
    id: string;
    name: string;
    city: string;
    status: string;
    capacity: number;
    kitty_amount: number;
    whatsapp_url: string | null;
  }>`select id, name, city, status, capacity, kitty_amount, whatsapp_url from circles where id = ${id}`;
  const circle = circles[0];
  if (!circle) throw new Error("Circle not found.");
  const members = await sql<{ id: string; name: string; area: string }>`
    select c.id, c.name, c.area
    from circle_memberships m
    join couples c on c.id = m.couple_id
    where m.circle_id = ${id}
  `;
  const waiting = (await couples(sql)).filter((row) =>
    canAssign(row.status, row.assigned, Number(circle.capacity), members.length),
  );
  const ledger = await sql<{ kind: LedgerKind; amount: number; note: string }>`
    select kind, amount, note from ledger where circle_id = ${id} order by created_at
  `;
  return { ...circle, members, waiting, kitty: balance(ledger), ledger };
}

export const getCircle = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => loadCircle(await ready(), data.id));

export const assignCouple = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; coupleId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const circle = await loadCircle(sql, data.circleId);
    const couple = (await couples(sql)).find((row) => row.id === data.coupleId);
    if (!couple || !canAssign(couple.status, couple.assigned, Number(circle.capacity), circle.members.length)) {
      throw new Error("That couple cannot join this Circle.");
    }
    await sql`insert into circle_memberships (id, circle_id, couple_id, status) values (${crypto.randomUUID()}, ${data.circleId}, ${data.coupleId}, 'ACTIVE')`;
    await sql`update couples set status = 'ASSIGNED', updated_at = now() where id = ${data.coupleId}`;
    return { ok: true };
  });

export const markKittyPaid = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; coupleId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const circles = await sql<{ kitty_amount: number }>`select kitty_amount from circles where id = ${data.circleId}`;
    const amount = circles[0]?.kitty_amount;
    if (!amount) throw new Error("Circle not found.");
    await sql.query("begin");
    try {
      const already = await sql<{ n: number }>`
        select count(*) as n from contributions where circle_id = ${data.circleId} and couple_id = ${data.coupleId} and status = 'PAID'
      `;
      if (Number(already[0]?.n) === 0) {
        const contributionId = crypto.randomUUID();
        await sql`insert into contributions (id, circle_id, couple_id, expected_amount, status, paid_at, recorded_by)
          values (${contributionId}, ${data.circleId}, ${data.coupleId}, ${amount}, 'PAID', now(), 'admin')`;
        await sql`insert into ledger (id, circle_id, kind, amount, note, reference_type, reference_id, created_by)
          values (${crypto.randomUUID()}, ${data.circleId}, 'CONTRIBUTION', ${amount}, ${data.coupleId}, 'CONTRIBUTION', ${contributionId}, 'admin')`;
      }
      await sql.query("commit");
    } catch (error) {
      await sql.query("rollback");
      throw error;
    }
    return { ok: true };
  });

export const addExpense = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; amount: number; note: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Amount must be a positive number.");
    const expenseId = crypto.randomUUID();
    const amount = Math.round(data.amount);
    const note = data.note.trim();
    if (!note) throw new Error("An expense needs a note.");
    await sql.query("begin");
    try {
      await sql`insert into expenses (id, circle_id, amount, note, status)
        values (${expenseId}, ${data.circleId}, ${amount}, ${note}, 'APPROVED')`;
      await sql`insert into ledger (id, circle_id, kind, amount, note, reference_type, reference_id, created_by)
        values (${crypto.randomUUID()}, ${data.circleId}, 'EXPENSE', ${amount}, ${note}, 'EXPENSE', ${expenseId}, 'admin')`;
      await sql.query("commit");
    } catch (error) {
      await sql.query("rollback");
      throw error;
    }
    return { ok: true };
  });

export const addAdminNote = createServerFn({ method: "POST" })
  .validator((data: { coupleId: string; body: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    const body = data.body.trim();
    if (!body) throw new Error("The note is empty.");
    await sql`insert into admin_notes (id, couple_id, body) values (${crypto.randomUUID()}, ${data.coupleId}, ${body})`;
    return { ok: true };
  });

export const setWhatsApp = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; url: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    const url = data.url.trim();
    if (url && !url.startsWith("https://chat.whatsapp.com/") && !url.startsWith("https://wa.me/")) {
      throw new Error("Use a WhatsApp group link.");
    }
    await sql`update circles set whatsapp_url = ${url || null} where id = ${data.circleId}`;
    return { ok: true };
  });

export const createCircle = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    const name = data.name.trim();
    if (name.length < 2) throw new Error("A Circle needs a name.");
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
    await sql`insert into circles (id, name, city, status, capacity, kitty_amount, description)
      values (${id}, ${name}, 'Bangalore', 'FORMING', 10, 10000, '')`;
    return { id };
  });

export const moveCouple = createServerFn({ method: "POST" })
  .validator((data: { coupleId: string; toCircleId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    await sql.query("begin");
    try {
      const current = await sql<{ id: string }>`
        select id from circle_memberships where couple_id = ${data.coupleId} and status = 'ACTIVE'
      `;
      const dest = await sql<{ capacity: number; taken: number }>`
        select c.capacity, count(m.couple_id) as taken
        from circles c
        left join circle_memberships m on m.circle_id = c.id and m.status = 'ACTIVE'
        where c.id = ${data.toCircleId}
        group by c.id
      `;
      const circle = dest[0];
      if (!circle) throw new Error("Circle not found.");
      if (Number(circle.taken) >= Number(circle.capacity)) throw new Error("That Circle is full.");
      if (current[0]) await sql`update circle_memberships set status = 'LEFT' where id = ${current[0].id}`;
      await sql`insert into circle_memberships (id, circle_id, couple_id, status)
        values (${crypto.randomUUID()}, ${data.toCircleId}, ${data.coupleId}, 'ACTIVE')`;
      await sql`update couples set status = 'ASSIGNED', updated_at = now() where id = ${data.coupleId}`;
      await sql.query("commit");
    } catch (error) {
      await sql.query("rollback");
      throw error;
    }
    return { ok: true };
  });

export const memberHome = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const actor = actorForRequest();
  if (actor.role === "anonymous" || !canReadCircle(actor, actor.role === "member" ? actor.circleId : "orion")) {
    throw new Error("This Circle is not available.");
  }
  const seated = await sql<{ circle_id: string }>`
    select circle_id from circle_memberships
    where couple_id = 'c1' and status = 'ACTIVE'
    limit 1
  `;
  const circleId = actor.role === "member" ? actor.circleId : seated[0]?.circle_id;
  if (!circleId) throw new Error("No Circle is assigned yet.");
  if (!canReadCircle(actor, circleId)) throw new Error("This Circle is not available.");
  const circle = await loadCircle(sql, circleId);
  const events = await sql<{ id: string; title: string; place: string; event_date: string | null }>`
    select id, title, place, event_date from events where circle_id = ${circleId} order by event_date
  `;
  const votes = await sql<{ couple_id: string; available: boolean }>`
    select couple_id, available from availability where event_id = 'e1'
  `;
  const paid = await sql<{ n: number }>`
    select count(*) as n from contributions where circle_id = ${circleId} and status = 'PAID'
  `;
  const yours = await sql<{ status: string }>`
    select status from contributions where circle_id = ${circleId} and couple_id = 'c1' and status = 'PAID' limit 1
  `;
  return {
    circle,
    events,
    votes,
    funding: {
      paid: Number(paid[0]?.n ?? 0),
      seats: Number(circle.capacity),
      yours: yours[0] ? "Paid" : "Pending",
    },
  };
});
