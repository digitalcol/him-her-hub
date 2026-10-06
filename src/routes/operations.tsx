import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { operationsQuestion, unlockOperations } from "@/lib/operations-lock";

export const Route = createFileRoute("/operations")({
  validateSearch: (search: Record<string, unknown>): { next: string } => ({
    next: typeof search.next === "string" && search.next.startsWith("/admin") ? search.next : "/admin/applications",
  }),
  loader: () => operationsQuestion(),
  head: () => ({ meta: [{ title: "Operations · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  component: OperationsGate,
});

function OperationsGate() {
  const question = Route.useLoaderData();
  const { next } = Route.useSearch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const answer = String(new FormData(event.currentTarget).get("answer") ?? "");
    try {
      await unlockOperations({ data: { answer } });
      window.location.assign(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That is not correct.");
      setPending(false);
      await router.invalidate();
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance text-fg">{question}</h1>
      <form className="mt-10 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-fg">
          Answer
          <input
            className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base text-fg"
            name="answer"
            inputMode="numeric"
            autoComplete="off"
            required
            autoFocus
          />
        </label>
        <button type="submit" className="h-11 bg-fg px-5 text-sm font-medium text-bg" disabled={pending}>
          Enter
        </button>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
      </form>
    </main>
  );
}
