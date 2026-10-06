import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { completeRoster, getRosterSlot, submitApplication } from "@/lib/club-api";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>): { for: string } => ({
    for: typeof search.for === "string" ? search.for : "",
  }),
  loaderDeps: ({ search }) => ({ for: search.for }),
  loader: ({ deps }) => (deps.for ? getRosterSlot({ data: { id: deps.for } }) : null),
  head: () => ({ meta: [{ title: "Waitlist · Him·Her·Hub" }] }),
  component: Apply,
});

const INTERESTS = ["Dining", "Travel", "Live music", "Theatre", "Outdoors", "House evenings", "Brunch", "Art", "Sports", "Weekend trips", "Food", "Wellness"];

function Apply() {
  const slot = Route.useLoaderData();
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
      const body = {
        one,
        two,
        area: String(form.get("area") ?? ""),
        anniversary: String(form.get("anniversary") ?? ""),
        referred: String(form.get("referred") ?? ""),
        about: String(form.get("about") ?? ""),
        interests: form.getAll("interests").map(String),
        organise: String(form.get("organise") ?? ""),
        privacyConsent: true as const,
        photoConsent: form.get("photo-consent") === "on",
        photos,
      };
      if (slot && !slot.filled) await completeRoster({ data: { ...body, coupleId: slot.id } });
      else await submitApplication({ data: body });
      setSent(true);
    } catch (caught) {
      setError(messageFrom(caught));
    }
  }

  if (slot?.filled) {
    const people = [slot.one, slot.two];
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
        <p className="text-xs tracking-index text-muted uppercase">Orion</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{slot.name}</h1>
        {slot.photos.length > 0 ? (
          <div className="mt-8 flex gap-3">
            {slot.photos.map((photo) => (
              <img key={photo.role} src={photo.src} alt="" className="size-24 rounded-full object-cover" />
            ))}
          </div>
        ) : null}
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {people.map((person) => (
            <li key={person.email || person.first_name} className="py-4 text-sm">
              <p className="font-medium text-fg">
                {person.first_name} {person.last_name}
              </p>
              <p className="mt-1 text-muted">{[person.profession, person.phone, person.email, person.instagram].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
        {slot.area ? <p className="mt-6 text-sm text-fg">{slot.area}</p> : null}
        {slot.about ? <p className="mt-3 max-w-xl text-sm text-pretty text-soft">{slot.about}</p> : null}
      </main>
    );
  }

  if (sent) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:px-10">
        <p className="text-xs tracking-index text-muted uppercase">{slot ? "Orion" : "Waitlist"}</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">{slot ? "We've got your details." : "You're on the waitlist."}</h1>
        <p className="mt-4 max-w-xl text-base text-pretty text-soft">
          {slot ? "Thank you. Your place in the Circle stays as it is." : "We've received your note. If there is a place for the two of you, we'll be in touch."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 lg:max-w-5xl lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{slot ? "Orion" : "Waitlist"}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance text-fg">{slot ? slot.name : "Join the waitlist."}</h1>
      <p className="mt-4 max-w-xl text-base text-pretty text-soft">{slot ? "Fill this in for the two of you." : "One form for the two of you."}</p>
      <form className="mt-12 space-y-12" onSubmit={onSubmit}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-16">
          <Partner title="01 / One of you" who="one" first={slot?.one.first_name} last={slot?.one.last_name} />
          <Partner title="02 / The other" who="two" first={slot?.two.first_name} last={slot?.two.last_name} />
        </div>
        <fieldset className="space-y-4">
          <legend className="text-xs tracking-index text-muted uppercase">03 / You two</legend>
          <Field label="Bangalore area" name="area" required />
          <Field label="Anniversary" name="anniversary" type="date" />
          <Field label="Referred by" name="referred" />
          <PhotoPick label="A photograph of the two of you" name="together-photo" />
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
          {slot ? "Save your details" : "Join the waitlist"}
        </button>
      </form>
    </main>
  );
}

function PhotoPick({ label, name }: { label: string; name: string }) {
  const [file, setFile] = useState("");
  return (
    <label className="block text-sm text-fg">
      {label}
      <span className="mt-2 flex min-h-16 w-full items-center justify-center border border-fg bg-fg px-4 text-center text-base font-medium text-bg">
        {file || "Tap to add a photograph"}
      </span>
      <input
        className="sr-only"
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        required
        onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")}
      />
    </label>
  );
}

function Partner({ title, who, first = "", last = "" }: { title: string; who: "one" | "two"; first?: string; last?: string }) {
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="text-xs tracking-index text-muted uppercase">{title}</legend>
      <Field label="First name" name={`${who}-first`} required defaultValue={first} />
      <Field label="Last name" name={`${who}-last`} required defaultValue={last} />
      <Field label="Date of birth" name={`${who}-dob`} type="date" required />
      <Field label="Mobile" name={`${who}-mobile`} type="tel" required placeholder="98765 43210" />
      <Field label="Email" name={`${who}-email`} type="email" required />
      <Field label="Profession" name={`${who}-profession`} required />
      <Field label="Instagram" name={`${who}-instagram`} />
      <PhotoPick label="Photograph" name={`${who}-photo`} />
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm text-fg">
      {label}
      <input className="mt-2 w-full border border-line bg-bg px-3 py-3 text-base" name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />
    </label>
  );
}

function messageFrom(caught: unknown) {
  const message =
    caught instanceof Error
      ? caught.message
      : caught && typeof caught === "object" && "message" in caught
        ? String((caught as { message: unknown }).message)
        : "";
  if (/413|too large/i.test(message)) return "Those photographs are too large. Please try once more.";
  return message || "The form could not be sent. Check the photographs and try again.";
}

function readPhoto(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("Add a photograph of each of you, and one of you together.");
  }
  return compressPhoto(value);
}

function compressPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const longest = Math.max(image.width, image.height) || 1;
      const scale = Math.min(1, 1400 / longest);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("That photograph could not be read."));
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      let data = canvas.toDataURL("image/jpeg", 0.8);
      if (data.length > 700_000) data = canvas.toDataURL("image/jpeg", 0.55);
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That photograph could not be read. Use a JPEG, PNG, or WebP."));
    };
    image.src = url;
  });
}
