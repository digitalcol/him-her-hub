import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { listApplications, setApplicationStatus } from "@/lib/club-api";
import { ReviewPortrait } from "@/components/review-portrait";
import type { AppStatus } from "@/lib/club-domain";

export const Route = createFileRoute("/admin/applications/")({
  head: () => ({ meta: [{ title: "Applications · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => listApplications(),
  component: Applications,
});

function Applications() {
  const rows = Route.useLoaderData();
  const router = useRouter();

  async function move(id: string, status: AppStatus) {
    await setApplicationStatus({ data: { id, status } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Applications.</h1>
      <p className="mt-4 text-sm text-muted">One of you, the other, then the two of you. Open a photograph to read the form.</p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rows.map((row) => {
          const [one, two] = row.partners;
          const attention = row.status === "NEW" || row.status === "REVIEWING";
          return (
            <li key={row.id} className="py-5">
              <div className="flex gap-4">
                <ReviewPortrait id={row.id} label={one?.first_name ?? "One"} src={row.portraits.one} attention={attention} />
                <ReviewPortrait id={row.id} label={two?.first_name ?? "Other"} src={row.portraits.two} attention={attention} />
                <ReviewPortrait id={row.id} label="Together" src={row.portraits.together} attention={attention} />
              </div>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <Link to="/admin/applications/$id" params={{ id: row.id }} className="font-medium text-fg">
                  {row.name}
                  <span className="ml-2 text-sm font-normal text-muted">{row.area}</span>
                </Link>
                <p className="text-sm text-fg">{row.label}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {row.status === "NEW" ? (
                  <button type="button" className="h-11" onClick={() => move(row.id, "REVIEWING")}>
                    Start review
                  </button>
                ) : null}
                {row.status === "REVIEWING" || row.status === "HOLD" ? (
                  <button type="button" className="h-11" onClick={() => move(row.id, "WAITING_FOR_CIRCLE")}>
                    Approve
                  </button>
                ) : null}
                {row.status === "REVIEWING" ? (
                  <button type="button" className="h-11 text-muted" onClick={() => move(row.id, "HOLD")}>
                    Hold
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
