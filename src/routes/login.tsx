import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { signInMember } from "@/lib/member-session";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Members · Him·Her·Hub" }] }),
  component: Login,
});

function Login() {
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await signInMember({
        data: {
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      });
      window.location.assign("/members/circle");
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "That username or password is not right.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Members</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Sign in.</h1>
      <p className="mt-4 text-base text-pretty text-soft">The username and password for your Circle.</p>
      <form className="mt-10 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-fg">
          Username
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base text-fg" name="username" required autoComplete="username" />
        </label>
        <label className="block text-sm text-fg">
          Password
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base text-fg" name="password" type="password" required autoComplete="current-password" />
        </label>
        <button type="submit" className="bg-fg px-5 py-3 text-sm font-medium text-bg" disabled={pending}>
          Sign in
        </button>
        {note ? (
          <p className="text-sm text-pretty text-soft" role="status">
            {note}
          </p>
        ) : null}
      </form>
    </main>
  );
}