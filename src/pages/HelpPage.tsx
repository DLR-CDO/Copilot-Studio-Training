import { COURSE_BUILDER, SUPPORT_EMAIL } from '../content/support'

const mailto = (email: string, subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`

export function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Help and support</h1>
      <p className="mt-2 text-muted">
        Stuck on a step, or your screen does not match the course? Copilot Studio changes often, so
        ask. Your question helps fix the course for the next group.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="support-team-heading"
          className="rounded-card border border-line bg-card p-5"
        >
          <h2 id="support-team-heading" className="font-display text-lg font-bold text-teal">
            Agent support team
          </h2>
          <p className="mt-2 text-sm text-muted">
            For questions about building agents, access, licenses, and environments.
          </p>
          <a
            href={mailto(SUPPORT_EMAIL, 'Copilot Studio Fundamentals: help request')}
            className="mt-3 inline-block break-all font-semibold text-violet underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </section>

        <section
          aria-labelledby="builder-heading"
          className="rounded-card border border-line bg-card p-5"
        >
          <h2 id="builder-heading" className="font-display text-lg font-bold text-teal">
            Course builder
          </h2>
          <p className="mt-2 text-sm text-muted">
            For problems with this course site: quizzes, progress, or certificates.
          </p>
          <p className="mt-3 font-semibold">{COURSE_BUILDER.name}</p>
          <a
            href={mailto(COURSE_BUILDER.email, 'Copilot Studio Fundamentals: course feedback')}
            className="inline-block break-all text-violet underline"
          >
            {COURSE_BUILDER.email}
          </a>
        </section>
      </div>

      <section aria-labelledby="include-heading" className="mt-8">
        <h2 id="include-heading" className="font-display text-lg font-bold">
          What to include in your email
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px]">
          <li>The module and step number, for example "Module 3, step 4".</li>
          <li>The environment name shown by the globe icon in Copilot Studio.</li>
          <li>What you expected to see, and what you saw instead.</li>
          <li>A screenshot, if it helps, with anything confidential blurred out.</li>
        </ul>
        <p className="mt-4 rounded-block border-l-4 border-red bg-red-soft px-4 py-3 text-sm">
          Never send passwords, keys, or confidential data, by email or in a screenshot.
        </p>
      </section>
    </div>
  )
}
