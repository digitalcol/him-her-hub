import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { ReviewPortrait } from "@/components/review-portrait";
import { memberHome } from "@/lib/club-api";

export const Route = createFileRoute("/members/people")({
  head: () => ({ meta: [{ title: "Members · Him·Her·Hub" }, { name: "robots", content: "noindex" }] }),
  loader: () => memberHome(),
  component: People,
});

function instagramHandle(value: string) {
  return value
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "");
}

function People() {
  const { circle } = Route.useLoaderData();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 lg:px-10">
      <p className="text-xs tracking-index text-muted uppercase">{circle.name}</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-fg">Members.</h1>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {circle.members.map((member) => {
          const [one, two] = member.partners;
          const href = `/apply?for=${member.id}`;
          return (
            <li key={member.id} className="py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex shrink-0 gap-4">
                  <ReviewPortrait href={href} label={one?.first_name || "One"} src={member.portraits.one} />
                  <ReviewPortrait href={href} label={two?.first_name || "Other"} src={member.portraits.two} />
                  <ReviewPortrait href={href} label="Together" src={member.portraits.together} />
                </div>
                <div className="min-w-0">
                  <a href={href} className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                    {member.name}
                  </a>
                  <p className="mt-2 text-sm text-muted">{member.area}</p>
                  {member.filled ? (
                    <ul className="mt-3 space-y-2 text-sm text-fg">
                      {member.partners.map((person) => {
                        const handle = person.instagram ? instagramHandle(person.instagram) : "";
                        const details = [person.profession, person.phone, person.email].filter(Boolean).join(" · ");
                        return (
                          <li key={person.email || person.first_name}>
                            {[person.first_name, person.last_name].filter(Boolean).join(" ")}
                            {details ? <span className="text-muted"> · {details}</span> : null}
                            {handle ? (
                              <>
                                <span className="text-muted"> · </span>
                                <a
                                  href={`https://instagram.com/${handle}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-fg underline underline-offset-2"
                                >
                                  <Instagram className="size-3.5" aria-hidden="true" />
                                  <span>Instagram @{handle}</span>
                                </a>
                              </>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <a href={href} className="mt-3 inline-flex text-sm text-fg underline">
                      Fill the form
                    </a>
                  )}
                  {member.about ? <p className="mt-3 max-w-xl text-sm text-pretty text-soft">{member.about}</p> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
