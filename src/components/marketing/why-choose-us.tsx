import {
  CalendarRangeIcon,
  CompassIcon,
  LayoutListIcon,
  SparklesIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: CompassIcon,
    title: "Discover destinations",
    body: "Browse popular cities and activities to spark your next itinerary.",
  },
  {
    icon: LayoutListIcon,
    title: "Organize every stop",
    body: "Keep cities, dates, and activities structured in one trip builder.",
  },
  {
    icon: CalendarRangeIcon,
    title: "See the full timeline",
    body: "Visualize your journey on a calendar so nothing overlaps by accident.",
  },
  {
    icon: SparklesIcon,
    title: "Plan with confidence",
    body: "Budgets and trip details stay with your account — private until you share.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Why travelers use GlobeTrotter
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A focused planning workspace — not a pile of notes and spreadsheets.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="space-y-3">
              <f.icon className="size-5 text-primary" />
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
