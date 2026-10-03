import { createFileRoute } from "@tanstack/react-router";
import { KittyStatement } from "@/components/kitty-statement";
import { memberHome } from "@/lib/club.server";

export const Route = createFileRoute("/members/kitty")({
  head: () => ({ meta: [{ title: "Kitty · Members · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: MemberKitty,
});

function MemberKitty() {
  const { circle } = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Your Circle</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Kitty.</h1>
      <KittyStatement circle={circle} />
    </main>
  );
}
