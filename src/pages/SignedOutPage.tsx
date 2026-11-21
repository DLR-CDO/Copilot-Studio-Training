export function SignedOutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-xl bg-paper px-5 py-12 text-ink">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal">Digital Realty</p>
      <h1 className="mt-1 font-display text-3xl font-bold">You&rsquo;re signed out</h1>
      <a
        href="/"
        className="mt-6 inline-flex rounded-pill bg-violet px-5 py-2.5 font-display text-sm font-semibold text-white"
      >
        Sign in again
      </a>
    </main>
  )
}
