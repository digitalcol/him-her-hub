import { createServerFn } from "@tanstack/react-start";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { z } from "zod";
import { actorForRequest, canMutateOperations, canReadCircle, isPreviewMode } from "@/lib/club-access";
import { CIRCLE_NAMES, isCircleName } from "@/lib/circle-names";
import { dbSource, getSql, runtimeDataDir, type Sql } from "@/lib/db";
import {
  type AppStatus,
  type LedgerKind,
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

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

const partner = z.object({
  first: z.string().trim().min(1).max(40),
  last: z.string().trim().min(1).max(40),
  dob: z.string().min(4),
  mobile: z
    .string()
    .trim()
    .refine((value) => {
      const digits = phoneDigits(value).length;
      return digits >= 8 && digits <= 15;
    }, "Enter a full mobile number."),
  email: z.string().trim().email().max(120),
  profession: z.string().trim().min(1).max(80),
  instagram: z.string().trim().max(80).optional().default(""),
});

const photo = z.string().trim().min(30).max(9_000_000);

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
  photos: z.object({
    one: photo,
    two: photo,
    together: photo,
  }),
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
  assertActor();
  const sql = await getSql();
  await seed(sql);
  await ensureRamSita(sql);
  await ensureOrionRoster(sql);
  await sql`update circles set whatsapp_url = null where whatsapp_url = ${"https://wa.me/"}`;
  if (isPreviewMode() && dbSource === "pglite") {
    await sql`insert into expenses (id, circle_id, amount, note, status)
      select 'exp-1', 'orion', 12400, 'The Long Table', 'APPROVED'
      where not exists (select 1 from expenses where id = 'exp-1')`;
    await sql`update circles
      set joining_fee = 25000,
          renewal_fee = 15000,
          rules = 'Hosts take turns. The kitty pays for the table. Renewal is due once a year.'
      where id = 'orion' and joining_fee = 0`;
    await sql`update circles
      set joining_fee = 18000,
          renewal_fee = 8000,
          rules = 'A second table. Hosts still rotate. Fees are this Circle’s own.'
      where id = 'vega' and joining_fee = 0`;
    await sql`update circle_memberships m
      set host_order = numbered.n
      from (
        select id, row_number() over (partition by circle_id order by joined_at, id) as n
        from circle_memberships
        where status = 'ACTIVE'
      ) numbered
      where m.id = numbered.id and m.host_order is null`;
  }
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
  circle: string | null;
};

const ORION_ROSTER = [
  ["orion-neeta-vishal", "Neeta", "", "Vishal", "", "Mar-26", 1, true],
  ["orion-priyanka-lalit", "Priyanka", "", "Lalit", "", "Apr-26", 2, false],
  ["orion-divya-goutham", "Divya", "", "Goutham", "Bharaj", "Oct-26", 3, false],
  ["orion-nikita-niraj", "Nikita", "", "Niraj", "", "Nov-26", 4, false],
  ["orion-priyanka-deepesh", "Priyanka", "", "Deepesh", "", "Dec-26", 5, false],
  ["orion-rachana-yash", "Rachana", "", "Yash", "", "Jan-27", 6, false],
  ["orion-seema-dilip", "Seema", "", "Dilip", "", "Feb-27", 7, true],
  ["orion-vishaka-anand", "Vishaka", "", "Anand", "", "Mar-27", 8, false],
  ["orion-ankita-kunal", "Ankita", "", "Kunal", "", "Apr-27", 9, false],
] as const;

async function ensureOrionRoster(sql: Sql) {
  let circles = await sql<{ id: string; kitty_amount: number }>`
    select id, kitty_amount from circles where lower(name) = 'orion' order by id limit 1
  `;
  if (!circles[0]) {
    await sql`insert into circles (id, name, city, status, capacity, kitty_amount, joining_fee, renewal_fee, rules, description)
      values ('orion', 'Orion', 'Bangalore', 'ACTIVE', 10, 10000, 0, 0, '', 'The first Circle.')`;
    circles = await sql<{ id: string; kitty_amount: number }>`select id, kitty_amount from circles where id = 'orion'`;
  }
  const circleId = circles[0].id;
  const kitty = Number(circles[0].kitty_amount);
  await sql`update circles set capacity = greatest(capacity, 10) where id = ${circleId}`;
  for (const [id, one, oneLast, two, twoLast, month, order, paid] of ORION_ROSTER) {
    const name = twoLast ? `${one} & ${two} ${twoLast}` : `${one} & ${two}`;
    const existing = await sql<{ id: string }>`select id from couples where id = ${id}`;
    if (existing.length === 0) {
      await sql`insert into couples (id, name, area, about, interests, status, photo_consent)
        values (${id}, ${name}, 'Bangalore', '', '', 'ASSIGNED', false)`;
      await sql`insert into people (id, couple_id, first_name, last_name)
        values (${`${id}-a`}, ${id}, ${one}, ${oneLast})`;
      await sql`insert into people (id, couple_id, first_name, last_name)
        values (${`${id}-b`}, ${id}, ${two}, ${twoLast})`;
    }
    const member = await sql<{ id: string }>`
      select id from circle_memberships where circle_id = ${circleId} and couple_id = ${id} and status = 'ACTIVE'
    `;
    if (member.length === 0) {
      await sql`insert into circle_memberships (id, circle_id, couple_id, status, host_order, host_label)
        values (${`m-${id}`}, ${circleId}, ${id}, 'ACTIVE', ${order}, ${month})`;
    } else {
      await sql`update circle_memberships
        set host_order = coalesce(host_order, ${order}),
            host_label = coalesce(host_label, ${month})
        where id = ${member[0].id}`;
    }
    if (!paid) continue;
    const already = await sql<{ n: number }>`
      select count(*) as n from contributions where circle_id = ${circleId} and couple_id = ${id} and status = 'PAID'
    `;
    if (Number(already[0]?.n) > 0) continue;
    const contributionId = `con-${id}`;
    await sql`insert into contributions (id, circle_id, couple_id, expected_amount, status, paid_at, recorded_by)
      values (${contributionId}, ${circleId}, ${id}, ${kitty}, 'PAID', now(), 'roster')
      on conflict (id) do nothing`;
    await sql`insert into ledger (id, circle_id, kind, amount, note, reference_type, reference_id, created_by)
      values (${`pay-${id}`}, ${circleId}, 'CONTRIBUTION', ${kitty}, ${name}, 'CONTRIBUTION', ${contributionId}, 'roster')
      on conflict (id) do nothing`;
  }
}

async function ensureRamSita(sql: Sql) {
  const existing = await sql<{ id: string }>`select id from couples where id = 'ram-sita'`;
  if (existing.length > 0) return;
  await sql`insert into couples (id, name, area, about, interests, referral, status, photo_consent, organise)
    values (
      'ram-sita',
      'Ram & Sita',
      'Oklipuram',
      'We are an amazing couple',
      'Dining, Travel, Live music, Theatre, Outdoors, House evenings',
      'Vishal',
      'NEW',
      true,
      'Yes'
    )`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession, instagram, phone, email, dob)
    values ('ram-sita-a', 'ram-sita', 'Ram', 'Jain', 'Artist', 'insta', '9898989898', '1@2.com', '2000-01-01')`;
  await sql`insert into people (id, couple_id, first_name, last_name, profession, instagram, phone, email, dob)
    values ('ram-sita-b', 'ram-sita', 'Sita', 'Jain', 'Musician', 'Facebook', '989898989891', '2@1.com', '2001-02-02')`;
  await sql`insert into application_assets (id, couple_id, role, mime, storage_key) values
    ('ram-sita-one', 'ram-sita', 'one', 'image/jpeg', 'kept:ram-sita-one'),
    ('ram-sita-two', 'ram-sita', 'two', 'image/jpeg', 'kept:ram-sita-two'),
    ('ram-sita-together', 'ram-sita', 'together', 'image/jpeg', 'kept:ram-sita-together')`;
}

function keptPhoto(key: string) {
  if (key === "kept:ram-sita-one") return "/kept/ram-sita-one.jpg";
  if (key === "kept:ram-sita-two") return "/kept/ram-sita-two.jpg";
  if (key === "kept:ram-sita-together") return "/kept/ram-sita-together.jpg";
  return "";
}

async function savePrivatePhoto(dataUrl: string) {
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw new Error("Each photograph must be a JPEG, PNG, or WebP.");
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length < 32 || bytes.length > 6 * 1024 * 1024) throw new Error("Each photograph must be under 6 MB.");
  const mime =
    bytes[0] === 0xff && bytes[1] === 0xd8
      ? "image/jpeg"
      : bytes[0] === 0x89 && bytes[1] === 0x50
        ? "image/png"
        : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp"
          : null;
  if (!mime) throw new Error("Each photograph must be a JPEG, PNG, or WebP.");
  const key = crypto.randomUUID();
  const dir = runtimeDataDir("private");
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/${key}`, bytes);
  return { key, mime };
}

const execFileAsync = promisify(execFile);

async function readThumb(key: string) {
  const kept = keptPhoto(key);
  if (kept) return kept;
  if (!/^[0-9a-f-]{36}$/i.test(key)) return "";
  const dir = runtimeDataDir("private");
  const src = `${dir}/${key}`;
  const dest = `${dir}/${key}.thumb.jpg`;
  try {
    await access(dest);
  } catch {
    try {
      await execFileAsync(
        "ffmpeg",
        ["-y", "-i", src, "-vf", "scale=240:240:force_original_aspect_ratio=increase,crop=240:240", "-frames:v", "1", "-q:v", "7", dest],
        { timeout: 20000 },
      );
    } catch {
      return "";
    }
  }
  try {
    const bytes = await readFile(dest);
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch {
    return "";
  }
}

async function readPrivatePhoto(key: string, mime: string) {
  const kept = keptPhoto(key);
  if (kept) return kept;
  if (!/^[0-9a-f-]{36}$/i.test(key)) return "";
  try {
    const bytes = await readFile(`${runtimeDataDir("private")}/${key}`);
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return "";
  }
}

async function couples(sql: Sql): Promise<CoupleRow[]> {
  return sql<CoupleRow>`
    select c.id, c.name, c.area, c.about, c.interests, c.referral, c.status,
      exists(select 1 from circle_memberships m where m.couple_id = c.id and m.status = 'ACTIVE') as assigned,
      (
        select ci.name from circle_memberships m
        join circles ci on ci.id = m.circle_id
        where m.couple_id = c.id and m.status = 'ACTIVE'
        limit 1
      ) as circle
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
  const people = await sql<{ couple_id: string; first_name: string; last_name: string; email: string | null; profession: string | null }>`
    select couple_id, first_name, last_name, email, profession from people order by id
  `;
  const assets = await sql<{ couple_id: string; role: string; storage_key: string }>`
    select couple_id, role, storage_key from application_assets
  `;
  const portraits: Record<string, Record<string, string>> = {};
  for (const asset of assets) {
    portraits[asset.couple_id] ??= {};
    portraits[asset.couple_id][asset.role] = await readThumb(asset.storage_key);
  }
  return rows.map((row) => ({
    ...row,
    label: displayStatus(row.status, row.assigned),
    partners: people.filter((person) => person.couple_id === row.id),
    portraits: portraits[row.id] ?? {},
  }));
});

export const getApplication = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<CoupleRow>`
      select c.id, c.name, c.area, c.about, c.interests, c.referral, c.status,
        exists(select 1 from circle_memberships m where m.couple_id = c.id and m.status = 'ACTIVE') as assigned,
        (
          select ci.name from circle_memberships m
          join circles ci on ci.id = m.circle_id
          where m.couple_id = c.id and m.status = 'ACTIVE'
          limit 1
        ) as circle
      from couples c where c.id = ${data.id}
    `;
    const couple = rows[0];
    if (!couple) throw new Error("Application not found.");
    const people = await sql<{
      first_name: string;
      last_name: string;
      dob: string | null;
      phone: string | null;
      email: string | null;
      profession: string | null;
      instagram: string | null;
    }>`
      select first_name, last_name, dob, phone, email, profession, instagram
      from people where couple_id = ${data.id} order by id
    `;
    const notes = await sql<{ id: string; body: string }>`
      select id, body from admin_notes where couple_id = ${data.id} order by created_at
    `;
    const assets = await sql<{ id: string; role: string; mime: string; storage_key: string }>`
      select id, role, mime, storage_key from application_assets where couple_id = ${data.id}
    `;
    const photos: Record<string, string> = {};
    for (const asset of assets) {
      photos[asset.role] = await readPrivatePhoto(asset.storage_key, asset.mime);
    }
    const detail = await sql<{ anniversary: string | null; organise: string | null; referral: string | null; photo_consent: boolean }>`
      select anniversary, organise, referral, photo_consent from couples where id = ${data.id}
    `;
    return {
      ...couple,
      ...detail[0],
      label: displayStatus(couple.status, couple.assigned),
      people,
      notes,
      photos,
    };
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

function applicationError(error: z.ZodError) {
  const lines = new Set<string>();
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path.endsWith("mobile")) lines.add("Enter a full mobile number for each of you.");
    else if (path.endsWith("email")) lines.add("Enter an email address for each of you.");
    else if (path.startsWith("photos")) lines.add("Add a photograph of each of you, and one of you together.");
    else if (path === "about") lines.add("Tell us a little about the two of you.");
    else if (path === "area") lines.add("Add your Bangalore area.");
    else if (path.endsWith("first") || path.endsWith("last")) lines.add("Enter both first and last names.");
    else lines.add("Check the fields and try again.");
  }
  return [...lines].join(" ");
}

export const submitApplication = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = applicationInput.safeParse(data);
    if (!parsed.success) throw new Error(applicationError(parsed.error));
    return parsed.data;
  })
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
    const interests = data.interests.join(", ");
    await sql`insert into couples (id, name, area, about, interests, referral, status, photo_consent, anniversary, organise)
      values (${id}, ${name}, ${data.area}, ${data.about}, ${interests}, ${data.referred || null}, 'NEW', ${data.photoConsent}, ${data.anniversary || null}, ${data.organise || null})`;
    for (const [key, person] of [
      ["a", data.one],
      ["b", data.two],
    ] as const) {
      await sql`insert into people (id, couple_id, first_name, last_name, profession, instagram, phone, email, dob)
        values (${`${id}-${key}`}, ${id}, ${person.first}, ${person.last}, ${person.profession}, ${normalizeInstagram(person.instagram)}, ${normalizePhone(person.mobile)}, ${person.email}, ${person.dob})`;
    }
    for (const [role, value] of [
      ["one", data.photos.one],
      ["two", data.photos.two],
      ["together", data.photos.together],
    ] as const) {
      const saved = await savePrivatePhoto(value);
      await sql`insert into application_assets (id, couple_id, role, mime, storage_key)
        values (${crypto.randomUUID()}, ${id}, ${role}, ${saved.mime}, ${saved.key})`;
    }
    return { id };
  });

export const getRosterSlot = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (!data.id) return null;
    const sql = await ready();
    const rows = await sql<{ id: string; name: string; filled: boolean }>`
      select c.id, c.name,
        exists (
          select 1 from people p
          where p.couple_id = c.id and p.email is not null and p.email <> ''
        ) as filled
      from couples c
      join circle_memberships m on m.couple_id = c.id and m.status = 'ACTIVE'
      where c.id = ${data.id}
    `;
    const row = rows[0];
    if (!row) return null;
    const people = await sql<{ first_name: string; last_name: string }>`
      select first_name, last_name from people where couple_id = ${data.id} order by id
    `;
    return {
      id: row.id,
      name: row.name,
      filled: row.filled,
      one: people[0] ?? { first_name: "", last_name: "" },
      two: people[1] ?? { first_name: "", last_name: "" },
    };
  });

export const completeRoster = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = applicationInput.extend({ coupleId: z.string().trim().min(1).max(80) }).safeParse(data);
    if (!parsed.success) throw new Error(applicationError(parsed.error));
    return parsed.data;
  })
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<{ id: string }>`
      select c.id from couples c
      join circle_memberships m on m.couple_id = c.id and m.status = 'ACTIVE'
      where c.id = ${data.coupleId}
    `;
    if (!rows[0]) throw new Error("That place could not be found.");
    const filled = await sql<{ n: number }>`
      select count(*) as n from people where couple_id = ${data.coupleId} and email is not null and email <> ''
    `;
    if (Number(filled[0]?.n) > 0) throw new Error("This form has already been received.");
    const name = `${data.one.first} & ${data.two.first}`;
    const interests = data.interests.join(", ");
    await sql`update couples
      set name = ${name},
          area = ${data.area},
          about = ${data.about},
          interests = ${interests},
          referral = ${data.referred || null},
          photo_consent = ${data.photoConsent},
          anniversary = ${data.anniversary || null},
          organise = ${data.organise || null},
          updated_at = now()
      where id = ${data.coupleId}`;
    for (const [key, person] of [
      ["a", data.one],
      ["b", data.two],
    ] as const) {
      await sql`update people
        set first_name = ${person.first},
            last_name = ${person.last},
            profession = ${person.profession},
            instagram = ${normalizeInstagram(person.instagram)},
            phone = ${normalizePhone(person.mobile)},
            email = ${person.email},
            dob = ${person.dob}
        where id = ${`${data.coupleId}-${key}`}`;
    }
    for (const [role, value] of [
      ["one", data.photos.one],
      ["two", data.photos.two],
      ["together", data.photos.together],
    ] as const) {
      const saved = await savePrivatePhoto(value);
      await sql`insert into application_assets (id, couple_id, role, mime, storage_key)
        values (${crypto.randomUUID()}, ${data.coupleId}, ${role}, ${saved.mime}, ${saved.key})`;
    }
    return { id: data.coupleId };
  });

export const listCircles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const circles = await sql<{ id: string; name: string; city: string; status: string; capacity: number; kitty_amount: number; joining_fee: number; renewal_fee: number; taken: number }>`
    select c.id, c.name, c.city, c.status, c.capacity, c.kitty_amount, c.joining_fee, c.renewal_fee,
      count(m.couple_id) filter (where m.status = 'ACTIVE') as taken
    from circles c
    left join circle_memberships m on m.circle_id = c.id
    group by c.id
    order by c.name
  `;
  const seated = await sql<{ circle_id: string; id: string; name: string }>`
    select m.circle_id, c.id, c.name
    from circle_memberships m
    join couples c on c.id = m.couple_id
    where m.status = 'ACTIVE'
    order by c.name
  `;
  return circles.map((circle) => ({
    ...circle,
    members: seated.filter((member) => member.circle_id === circle.id),
  }));
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
    joining_fee: number;
    renewal_fee: number;
    rules: string;
  }>`select id, name, city, status, capacity, kitty_amount, whatsapp_url, joining_fee, renewal_fee, rules from circles where id = ${id}`;
  const circle = circles[0];
  if (!circle) throw new Error("Circle not found.");
  const members = await sql<{ id: string; name: string; area: string; host_order: number | null; host_label: string | null; paid: boolean; filled: boolean }>`
    select c.id, c.name, c.area, m.host_order, m.host_label,
      exists (
        select 1 from contributions k
        where k.circle_id = m.circle_id and k.couple_id = c.id and k.status = 'PAID'
      ) as paid,
      exists (
        select 1 from people p
        where p.couple_id = c.id and p.email is not null and p.email <> ''
      ) as filled
    from circle_memberships m
    join couples c on c.id = m.couple_id
    where m.circle_id = ${id} and m.status = 'ACTIVE'
    order by m.host_order nulls last, c.name
  `;
  const waiting = (await couples(sql)).filter((row) =>
    canAssign(row.status, row.assigned, Number(circle.capacity), members.length),
  );
  const others = await sql<{ id: string; name: string; capacity: number; taken: number }>`
    select c.id, c.name, c.capacity, count(m.couple_id) filter (where m.status = 'ACTIVE') as taken
    from circles c
    left join circle_memberships m on m.circle_id = c.id
    where c.id <> ${id}
    group by c.id
    order by c.name
  `;
  const ledger = await sql<{ kind: LedgerKind; amount: number; note: string }>`
    select kind, amount, note from ledger where circle_id = ${id} order by created_at
  `;
  const billRows = await sql<{ id: string; amount: number; note: string; bill_key: string | null; bill_mime: string | null }>`
    select id, amount, note, bill_key, bill_mime from expenses
    where circle_id = ${id} and status = 'APPROVED'
    order by created_at
  `;
  const each = Number(circle.kitty_amount);
  const opening = members.length * each;
  let running = opening;
  const bills = [];
  for (const row of billRows) {
    running -= Number(row.amount);
    bills.push({
      id: row.id,
      note: row.note,
      amount: Number(row.amount),
      balance: running,
      bill: row.bill_key ? await readThumb(row.bill_key) : "",
    });
  }
  return { ...circle, members, waiting, others, kitty: running, opening, each, bills, ledger };
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
    await sql`insert into circle_memberships (id, circle_id, couple_id, status, host_order)
      values (${crypto.randomUUID()}, ${data.circleId}, ${data.coupleId}, 'ACTIVE', ${circle.members.length + 1})`;
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
  .validator((data: { circleId: string; amount: number; note: string; bill: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Amount must be a positive number.");
    const expenseId = crypto.randomUUID();
    const amount = Math.round(data.amount);
    const note = data.note.trim();
    if (!note) throw new Error("An expense needs a note.");
    const bill = await savePrivatePhoto(data.bill);
    await sql.query("begin");
    try {
      await sql`insert into expenses (id, circle_id, amount, note, status, bill_key, bill_mime)
        values (${expenseId}, ${data.circleId}, ${amount}, ${note}, 'APPROVED', ${bill.key}, ${bill.mime})`;
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
  .validator((data: { name: string; rules: string; kittyAmount: number; joiningFee: number; renewalFee: number }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    const name = data.name.trim();
    if (!isCircleName(name)) throw new Error("Choose a name from the star list.");
    const rules = data.rules.trim();
    if (rules.length < 12) throw new Error("Write the rules for this Circle.");
    const kitty = Math.round(Number(data.kittyAmount));
    const joining = Math.round(Number(data.joiningFee));
    const renewal = Math.round(Number(data.renewalFee));
    if (!Number.isFinite(kitty) || kitty <= 0) throw new Error("The kitty contribution must be an amount.");
    if (![joining, renewal].every((value) => Number.isFinite(value) && value >= 0)) {
      throw new Error("Joining and renewal can be zero, but not blank.");
    }
    const taken = await sql<{ id: string }>`select id from circles where lower(name) = lower(${name})`;
    if (taken[0]) throw new Error("That name is already a Circle.");
    const id = name.toLowerCase();
    await sql`insert into circles (id, name, city, status, capacity, kitty_amount, joining_fee, renewal_fee, rules, description)
      values (${id}, ${name}, 'Bangalore', 'FORMING', 10, ${kitty}, ${joining}, ${renewal}, ${rules}, ${rules})`;
    return { id };
  });

export const circleNameChoices = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const used = await sql<{ name: string }>`select name from circles`;
  const taken = new Set(used.map((row) => row.name.toLowerCase()));
  return CIRCLE_NAMES.filter((name) => !taken.has(name.toLowerCase()));
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
      await sql`insert into circle_memberships (id, circle_id, couple_id, status, host_order)
        values (${crypto.randomUUID()}, ${data.toCircleId}, ${data.coupleId}, 'ACTIVE', ${Number(circle.taken) + 1})`;
      await sql`update couples set status = 'ASSIGNED', updated_at = now() where id = ${data.coupleId}`;
      await sql.query("commit");
    } catch (error) {
      await sql.query("rollback");
      throw error;
    }
    return { ok: true };
  });

export const removeCouple = createServerFn({ method: "POST" })
  .validator((data: { circleId: string; coupleId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await ready();
    if (!canMutateOperations(actorForRequest())) throw new Error("Not allowed.");
    const current = await sql<{ id: string }>`
      select id from circle_memberships
      where circle_id = ${data.circleId} and couple_id = ${data.coupleId} and status = 'ACTIVE'
    `;
    if (!current[0]) throw new Error("That couple is not in this Circle.");
    await sql`update circle_memberships set status = 'LEFT' where id = ${current[0].id}`;
    await sql`update couples set status = 'WAITING_FOR_CIRCLE', updated_at = now() where id = ${data.coupleId}`;
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
  const named = seated[0]
    ? []
    : await sql<{ id: string }>`select id from circles where lower(name) = 'orion' order by id limit 1`;
  const circleId = actor.role === "member" ? actor.circleId : (seated[0]?.circle_id ?? named[0]?.id);
  if (!circleId) throw new Error("No Circle is assigned yet.");
  if (!canReadCircle(actor, circleId)) throw new Error("This Circle is not available.");
  const circle = await loadCircle(sql, circleId);
  const events = await sql<{ id: string; title: string; place: string; event_date: string | null; host_name: string | null }>`
    select e.id, e.title, e.place, e.event_date, host.name as host_name
    from events e
    left join couples host on host.id = e.host_couple_id
    where e.circle_id = ${circleId}
    order by e.event_date
  `;
  const votes = await sql<{ couple_id: string; available: boolean }>`
    select couple_id, available from availability where event_id = 'e1'
  `;
  const replies = await sql<{ event_id: string; couple_id: string; name: string; available: boolean; choice: string | null }>`
    select a.event_id, a.couple_id, c.name, a.available, a.choice
    from availability a
    join couples c on c.id = a.couple_id
    join events e on e.id = a.event_id
    where e.circle_id = ${circleId}
  `;
  const notices = await sql<{ id: string; title: string; body: string; circle_id: string | null }>`
    select id, title, body, circle_id from notices
    where circle_id is null or circle_id = ${circleId}
    order by created_at desc
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
    replies,
    notices,
    you: "c1",
    funding: {
      paid: Number(paid[0]?.n ?? 0),
      seats: Number(circle.capacity),
      yours: yours[0] ? "Paid" : "Pending",
    },
  };
});
