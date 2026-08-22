const STEPS = [
  {
    n: "1",
    title: "Basics",
    body: "Name your trip and set travel dates.",
  },
  {
    n: "2",
    title: "Route",
    body: "Choose start and end points for the journey.",
  },
  {
    n: "3",
    title: "Cover & budget",
    body: "Add a cover photo and optional spending limit.",
  },
  {
    n: "4",
    title: "Packing",
    body: "Pick packing suggestions for your travel window.",
  },
  {
    n: "5",
    title: "Review",
    body: "Confirm, save, then build stops in the itinerary builder.",
  },
] as const;

export function BookingStepsPreview() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How trip booking works
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A simple five-step flow — the same stepper you use when creating a
          trip inside GlobeTrotter.
        </p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-border bg-background/80 p-4"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
