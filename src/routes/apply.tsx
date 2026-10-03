import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { submitApplication } from "@/lib/club-api";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Waitlist · Him·Her·Hub" }] }),
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
      const photos = {
        one: await readPhoto(form.get("one-photo")),
        two: await readPhoto(form.get("two-photo")),
        together: await readPhoto(form.get("together-photo")),
      };
      const one = read("one");
      const two = read("two");
      if ([one.mobile, two.mobile].some((value) => value.replace(/\D/g, "").length < 8)) {
        throw new Error("Enter a full mobile number for each of you.");
      }
      await submitApplication({
        data: {
          one,
          two,
          area: String(form.get("area") ?? ""),
          anniversary: String(form.get("anniversary") ?? ""),
          referred: String(form.get("referred") ?? ""),
          about: String(form.get("about") ?? ""),
          interests: form.getAll("interests").map(String),
          organise: String(form.get("organise") ?? ""),
          privacyConsent: true,
          photoConsent: form.get("photo-consent") === "on",
          photos,
        },
      });
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the fields and try again. Both people, three photographs, a Bangalore area, and a short note are required.");
    }
  }

  if (sent) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
        <p className="text-xs tracking-index text-muted uppercase">Waitlist</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">You're on the waitlist.</h1>
        <p className="mt-4 max-w-xl text-base text-pretty text-soft">
          We've received your note. If there is a place for the two of you, we'll be in touch.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">Waitlist</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">Join the waitlist.</h1>
      <p className="mt-4 max-w-xl text-base text-pretty text-soft">One form for the two of you.</p>
      <form className="mt-12 space-y-12" onSubmit={onSubmit}>
        <Partner title="01 / One of you" who="one" />
        <Partner title="02 / The other" who="two" />
        <fieldset className="space-y-4">
          <legend className="text-xs tracking-index text-muted uppercase">03 / You two</legend>
          <Field label="Bangalore area" name="area" required />
          <Field label="Anniversary" name="anniversary" type="date" />
          <Field label="Referred by" name="referred" />
          <label className="block text-sm text-fg">
            A photograph of the two of you
            <input className="mt-2 block w-full text-sm" name="together-photo" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
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
            We can use this to consider the two of you for the club.
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="photo-consent" className="mt-1" />
            Photographs we take later may be published. This is separate, and optional.
          </label>
        </fieldset>
        {error ? <p className="text-sm text-soft">{error}</p> : null}
        <button type="submit" className="h-11 bg-fg px-5 text-sm font-medium text-bg">
          Join the waitlist
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
      <Field label="Mobile" name={`${who}-mobile`} type="tel" required placeholder="98765 43210" />
      <Field label="Email" name={`${who}-email`} type="email" required />
      <Field label="Profession" name={`${who}-profession`} required />
      <Field label="Instagram" name={`${who}-instagram`} />
      <label className="block text-sm text-fg">
        Photograph
        <input className="mt-2 block w-full text-sm" name={`${who}-photo`} type="file" accept="image/jpeg,image/png,image/webp" required />
      </label>
    </fieldset>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block text-sm text-fg">
      {label}
      <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base" name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function readPhoto(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Add a photograph of each of you, and one of you together.");
  }
  if (value.size > 6 * 1024 * 1024) throw new Error("Each photograph must be under 6 MB.");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That photograph could not be read."));
    reader.readAsDataURL(value);
  });
}
