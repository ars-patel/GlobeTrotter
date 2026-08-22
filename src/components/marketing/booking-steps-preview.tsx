const STEPS = [
  {
    n: "01",
    title: "Search",
    body: "Find your destination and travel date.",
  },
  {
    n: "02",
    title: "Compare",
    body: "Compare available trips, prices and schedules.",
  },
  {
    n: "03",
    title: "Book",
    body: "Select your preferred journey and complete your booking.",
  },
  {
    n: "04",
    title: "Travel",
    body: "Get your booking details and enjoy your journey.",
  },
] as const;

export function BookingStepsPreview() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-muted/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="font-display text-4xl font-bold text-primary/25">
                {s.n}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
