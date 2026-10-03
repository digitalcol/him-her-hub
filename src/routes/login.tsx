import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Members · Him·Her·Hub" }] }),
  component: Login,
});

function Login() {
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    if (!email.includes("@") || password.length < 8) {
      setNote("Use the email on your application and a password of at least 8 characters.");
      return;
    }
    setNote("Member access is not open on the public site. When your Circle is ready, we send a way in.");
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Members</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Sign in.</h1>
      <p className="mt-4 text-base text-pretty text-soft">For couples already in a Circle. This does not create a membership.</p>
      <form className="mt-10 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm text-fg">
          Email
          <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base text-fg" name="email" type="email" required autoComplete="username" />
        </label>
        <label className="block text-sm text-fg">
          Password
          <input
            className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base text-fg"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="bg-fg px-5 py-3 text-sm font-medium text-bg">
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
