import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { submitApplication } from "@/lib/club.server";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Apply · Him·Her·Hub" }] }),
  component: Apply,
});

const INTERESTS = ["Dining", "Travel", "Live music", "Theatre", "Outdoors", "House evenings", "Brunch", "Art", "Sports", "Weekend trips", "Food", "Wellness"];

function Apply() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const read = (who: "one" | "two") => ({
      first: String(form.get(`${who}-first`) ?? ""),
      last: String(form.get(`${who}-last`) ?? ""),
      dob: String(form.get(`${who}-dob`) ?? ""),
      mobile: String(form.get(`${who}-mobile`) ?? ""),
      email: String(form.get(`${who}-email`) ?? ""),
      profession: String(form.get(`${who}-profession`) ?? ""),
      instagram: String(form.get(`${who}-instagram`) ?? ""),
    });
    try {
      await submitApplication({
        data: {
          one: read("one"),
          two: read("two"),
          area: String(form.get("area") ?? ""),
          anniversary: String(form.get("anniversary") ?? ""),
          referred: String(form.get("referred") ?? ""),
          about: String(form.get("about") ?? ""),
          interests: form.getAll("interests").map(String),
          organise: String(form.get("organise") ?? ""),
          privacyConsent: true,
          photoConsent: form.get("photo-consent") === "on",
        },
      });
      setSent(true);
    } catch {
      setError("Check the fields and try again. Both people, a Bangalore area, and a short note are required.");
    }
  }

  if (sent) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
        <p className="text-xs tracking-index text-muted uppercase">Apply</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Application received.</h1>
        <p className="mt-4 max-w-xl text-base text-pretty text-soft">
          We've received your application. Every application is reviewed individually. If we think there's a Circle that fits, we'll be in touch.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Apply</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">Apply together.</h1>
      <p className="mt-4 max-w-xl text-base text-pretty text-soft">One application for the two of you.</p>
      <form className="mt-12 space-y-12" onSubmit={onSubmit}>
        <Partner title="01 / One of you" who="one" />
        <Partner title="02 / The other" who="two" />
        <fieldset className="space-y-4">
          <legend className="text-xs tracking-index text-muted uppercase">03 / You two</legend>
          <Field label="Bangalore area" name="area" required />
          <Field label="Anniversary" name="anniversary" type="date" />
          <Field label="Referred by" name="referred" />
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="text-xs tracking-index text-muted uppercase">04 / A little about you</legend>
          <label className="block text-sm text-fg">
            Tell us about the two of you
            <textarea className="mt-2 min-h-32 w-full border border-line bg-bg px-3 py-3 text-base" name="about" required maxLength={600} />
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <label key={interest} className="inline-flex h-11 items-center gap-2 border border-line px-3 text-sm">
                <input type="checkbox" name="interests" value={interest} />
                {interest}
              </label>
            ))}
          </div>
          <Field label="What would you enjoy organising?" name="organise" />
        </fieldset>
        <fieldset className="space-y-3 text-sm text-soft">
          <legend className="text-xs tracking-index text-muted uppercase">05 / Review</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="privacy" required className="mt-1" />
            We can use this application to review the two of you for a Circle.
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="photo-consent" className="mt-1" />
            Photographs we take later may be published. This is separate, and optional.
          </label>
        </fieldset>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-5 text-sm font-medium text-bg">
          Apply together
        </button>
      </form>
    </main>
  );
}

function Partner({ title, who }: { title: string; who: "one" | "two" }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs tracking-index text-muted uppercase">{title}</legend>
      <Field label="First name" name={`${who}-first`} required />
      <Field label="Last name" name={`${who}-last`} required />
      <Field label="Date of birth" name={`${who}-dob`} type="date" required />
      <Field label="Mobile" name={`${who}-mobile`} type="tel" required />
      <Field label="Email" name={`${who}-email`} type="email" required />
      <Field label="Profession" name={`${who}-profession`} required />
      <Field label="Instagram" name={`${who}-instagram`} />
    </fieldset>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm text-fg">
      {label}
      <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base" name={name} type={type} required={required} />
    </label>
  );
}
