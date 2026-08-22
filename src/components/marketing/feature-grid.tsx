import {
  CalendarDaysIcon,
  ChartPieIcon,
  MapIcon,
  SearchIcon,
  Share2Icon,
  ShieldIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapIcon,
    title: "Multi-city itineraries",
    body: "Add stops, reorder cities, and assign day-by-day activities.",
  },
  {
    icon: ChartPieIcon,
    title: "Budget & cost charts",
    body: "Track transport, stay, meals, and activities with live totals.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Calendar timeline",
    body: "Expand days, reorder activities, and quick-edit your plan.",
  },
  {
    icon: SearchIcon,
    title: "City & activity search",
    body: "Find destinations and experiences, then add them to a trip.",
  },
  {
    icon: Share2Icon,
    title: "Public sharing",
    body: "Publish a read-only link so others can view or copy your trip.",
  },
  {
    icon: ShieldIcon,
    title: "Admin analytics",
    body: "Platform stats for trips, cities, and user engagement.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to plan
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Built features that take you from idea to itinerary — search, build,
          budget, schedule, and share.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-none"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
