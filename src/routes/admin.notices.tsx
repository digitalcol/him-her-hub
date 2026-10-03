import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { listCircles } from "@/lib/club-api";
import { listNotices, sendNotice } from "@/lib/notices";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({ meta: [{ title: "Notices · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: async () => ({ circles: await listCircles(), notices: await listNotices() }),
  component: Notices,
});

function Notices() {
  const { circles, notices } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await sendNotice({
        data: {
          circleId: String(data.get("circle") ?? "all"),
          title: String(data.get("title") ?? ""),
          body: String(data.get("body") ?? ""),
        },
      });
      form.reset();
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The notice could not be sent.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Operations</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Notices.</h1>
      <p className="mt-4 max-w-xl text-sm text-pretty text-muted">
        Send a note to one Circle, or to every Circle at once. Members see it when they open their Circle. There is no chat, and phone alerts wait until the app.
      </p>
      <form className="mt-10 max-w-xl space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-fg">
          To
          <select className="mt-2 w-full border border-line bg-bg px-3 py-3" name="circle" defaultValue="all">
            <option value="all">Everyone</option>
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-fg">
          Title
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3" name="title" required />
        </label>
        <label className="block text-sm text-fg">
          Message
          <textarea className="mt-2 min-h-28 w-full border border-line bg-bg px-3 py-3" name="body" required />
        </label>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-5 text-sm font-medium text-bg">
          Send notice
        </button>
      </form>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {notices.length === 0 ? <li className="py-3 text-sm text-muted">No notices yet.</li> : null}
        {notices.map((notice) => (
          <li key={notice.id} className="py-4">
            <p className="text-xs tracking-index text-muted uppercase">{notice.circle_name ?? "Everyone"}</p>
            <p className="mt-1 font-medium text-fg">{notice.title}</p>
            <p className="mt-1 text-sm text-pretty text-soft">{notice.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
