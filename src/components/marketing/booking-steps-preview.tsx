const STEPS = [
  {
    n: "01",
    title: "Sign up or log in",
    body: "Create your GlobeTrotter account so every trip stays saved to you.",
  },
  {
    n: "02",
    title: "Plan New Trip",
    body: "Give your trip a name, choose start and end dates, and add a short description.",
  },
  {
    n: "03",
    title: "Add cities & activities",
    body: "Build each stop, pick activities for the days you are there, and reorder as needed.",
  },
  {
    n: "04",
    title: "Review budget & share",
    body: "Check estimated costs, open your calendar view, then share the plan when you are ready.",
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
          How to book your trip
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four simple steps from account to a complete multi-city itinerary.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
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
