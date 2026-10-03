import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getApplication, setApplicationStatus } from "@/lib/club.server";
import type { AppStatus } from "@/lib/club-domain";

export const Route = createFileRoute("/admin/applications/$id")({
  head: () => ({ meta: [{ title: "Application · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getApplication({ data: { id: params.id } }),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const row = Route.useLoaderData();
  const router = useRouter();

  async function move(status: AppStatus) {
    await setApplicationStatus({ data: { id: row.id, status } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Application</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{row.name}</h1>
      <p className="mt-4 text-sm text-muted">
        {row.area} · {row.label}
      </p>
      <p className="mt-6 max-w-xl text-base text-pretty text-soft">{row.about}</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {row.people.map((person) => (
          <li key={person.first_name} className="py-3 text-sm text-fg">
            {person.first_name}
            {person.profession ? ` · ${person.profession}` : ""}
          </li>
        ))}
      </ul>
      {row.interests ? <p className="mt-6 text-sm text-muted">{row.interests}</p> : null}
      <div className="mt-8 flex gap-4 text-sm">
        {row.status === "NEW" ? (
          <button type="button" className="h-11 bg-fg px-4 text-bg" onClick={() => move("REVIEWING")}>
            Start review
          </button>
        ) : null}
        {row.status === "REVIEWING" || row.status === "HOLD" ? (
          <button type="button" className="h-11 bg-fg px-4 text-bg" onClick={() => move("WAITING_FOR_CIRCLE")}>
            Approve
          </button>
        ) : null}
        {row.status !== "DECLINED" && row.status !== "APPROVED" ? (
          <button type="button" className="h-11 px-2 text-muted" onClick={() => move("DECLINED")}>
            Decline
          </button>
        ) : null}
      </div>
    </main>
  );
}
