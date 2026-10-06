import { createFileRoute } from "@tanstack/react-router";
import { PaidMark } from "@/components/kitty-statement";
import { memberHome } from "@/lib/club-api";

export const Route = createFileRoute("/members/people")({
  head: () => ({ meta: [{ title: "Members · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: People,
});

function People() {
  const { circle } = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.name}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Members.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {circle.members.map((member) => (
          <li key={member.id} className="flex items-baseline justify-between gap-6 py-4">
            <p className="min-w-0 font-medium text-fg">
              {member.name}
              <PaidMark paid={member.paid} />
              {member.host_label ? <span className="mt-1 block text-sm font-normal text-muted">{member.host_label}</span> : null}
            </p>
            <p className="shrink-0 text-sm text-muted">{member.area}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">Kitty remaining ₹{circle.kitty.toLocaleString("en-IN")}</p>
    </main>
  );
}