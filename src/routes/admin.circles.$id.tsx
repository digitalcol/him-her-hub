import { createFileRoute, useRouter } from "@tanstack/react-router";
import { assignCouple, getCircle, markKittyPaid } from "@/lib/club.server";

export const Route = createFileRoute("/admin/circles/$id")({
  head: () => ({ meta: [{ title: "Circle · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: ({ params }) => getCircle({ data: { id: params.id } }),
  component: CircleDetail,
});

function CircleDetail() {
  const circle = Route.useLoaderData();
  const router = useRouter();

  async function add(coupleId: string) {
    await assignCouple({ data: { circleId: circle.id, coupleId } });
    await router.invalidate();
  }

  async function paid(coupleId: string) {
    await markKittyPaid({ data: { circleId: circle.id, coupleId } });
    await router.invalidate();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.city}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{circle.name}</h1>
      <p className="mt-4 text-sm text-muted">
        {circle.members.length} / {circle.capacity} · kitty ₹{circle.kitty.toLocaleString("en-IN")}
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex items-center justify-between py-3">
            <p className="font-medium text-fg">{member.name}</p>
            <button type="button" className="h-11 text-sm text-muted" onClick={() => paid(member.id)}>
              Mark kitty paid
            </button>
          </li>
        ))}
      </ul>
      {circle.waiting.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs tracking-index text-muted uppercase">Waiting for a Circle</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {circle.waiting.map((couple) => (
              <li key={couple.id} className="flex items-center justify-between py-3">
                <p className="text-fg">
                  {couple.name}
                  <span className="text-muted"> · {couple.area}</span>
                </p>
                <button type="button" className="h-11 text-sm font-medium text-fg" onClick={() => add(couple.id)}>
                  Add to {circle.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
