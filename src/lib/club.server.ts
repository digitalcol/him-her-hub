import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
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

function assertOpen() {
  if (process.env.PREVIEW_MODE === "false") {
    throw new Error("Club tools are closed until member and admin sign-in is on.");
  }
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
  const existing = await sql<{ n: number }>`select count(*) as n from circles`;
  if (Number(existing[0]?.n) > 0) return;

  await sql`insert into circles (id, name, city, status, capacity, kitty_amount, whatsapp_url, start_date)
    values ('orion', 'Orion', 'Bangalore', 'ACTIVE', 10, 10000, 'https://wa.me/', '2026-10-12')`;

  const seated = [
    ["c1", "Asha & Nikhil", "Indiranagar", "Asha", "Nikhil", "Architect", "Editor"],
    ["c2", "Diya & Kabir", "Koramangala", "Diya", "Kabir", "Designer", "Cook"],
    ["c3", "Naina & Vivek", "Jayanagar", "Naina", "Vivek", "Doctor", "Musician"],
  ] as const;

  for (const [id, name, area, firstA, firstB, jobA, jobB] of seated) {
    await sql`insert into couples (id, name, area, about, interests, status, photo_consent)
      values (${id}, ${name}, ${area}, 'In Orion.', 'Dining, Travel', 'APPROVED', false)`;
    await sql`insert into people (id, couple_id, first_name, last_name, profession)
      values (${`${id}-a`}, ${id}, ${firstA}, '', ${jobA})`;
    await sql`insert into people (id, couple_id, first_name, last_name, profession)
      values (${`${id}-b`}, ${id}, ${firstB}, '', ${jobB})`;
    await sql`insert into circle_memberships (circle_id, couple_id) values ('orion', ${id})`;
    await sql`insert into ledger (id, circle_id, kind, amount, note)
      values (${`pay-${id}`}, 'orion', 'CONTRIBUTION', 10000, ${name})`;
  }

  await sql`insert into couples (id, name, area, about, interests, referral, status, photo_consent)
    values ('wait', 'Leela & Sameer', 'Whitefield', 'Waiting for a Circle.', 'Live music, Food', 'Asha', 'APPROVED', true)`;
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
  assertOpen();
  const sql = await getSql();
  await seed(sql);
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
    return { ...couple, label: displayStatus(couple.status, couple.assigned), people };
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
    await sql`update couples set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .validator((data: unknown) => applicationInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await ready();
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
    await sql`insert into circle_memberships (circle_id, couple_id) values (${data.circleId}, ${data.coupleId})`;
    return { ok: true };
  });

export const markKittyPaid = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; coupleId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const circles = await sql<{ kitty_amount: number }>`select kitty_amount from circles where id = ${data.circleId}`;
    const amount = circles[0]?.kitty_amount;
    if (!amount) throw new Error("Circle not found.");
    const already = await sql<{ n: number }>`
      select count(*) as n from ledger where circle_id = ${data.circleId} and kind = 'CONTRIBUTION' and note = ${data.coupleId}
    `;
    if (Number(already[0]?.n) > 0) return { ok: true };
    await sql`insert into ledger (id, circle_id, kind, amount, note)
      values (${crypto.randomUUID()}, ${data.circleId}, 'CONTRIBUTION', ${amount}, ${data.coupleId})`;
    return { ok: true };
  });

export const addExpense = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; amount: number; note: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Amount must be a positive number.");
    await sql`insert into ledger (id, circle_id, kind, amount, note)
      values (${crypto.randomUUID()}, ${data.circleId}, 'EXPENSE', ${Math.round(data.amount)}, ${data.note.trim()})`;
    return { ok: true };
  });

export const memberHome = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const circle = await loadCircle(sql, "orion");
  const events = await sql<{ id: string; title: string; place: string; event_date: string | null }>`
    select id, title, place, event_date from events where circle_id = 'orion' order by event_date
  `;
  const votes = await sql<{ couple_id: string; available: boolean }>`
    select couple_id, available from availability where event_id = 'e1'
  `;
  return { circle, events, votes };
});
