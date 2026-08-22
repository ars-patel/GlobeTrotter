import {
  CalendarDaysIcon,
  MapPinnedIcon,
  Share2Icon,
  WalletIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPinnedIcon,
    title: "Multi-city itineraries",
    body: "Add stops, set dates, and reorder cities until the route feels right.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Day-by-day activities",
    body: "Attach experiences to each stop and see your trip on a clear timeline.",
  },
  {
    icon: WalletIcon,
    title: "Budget visibility",
    body: "Track estimated costs as you plan so surprises stay off the itinerary.",
  },
  {
    icon: Share2Icon,
    title: "Share your plans",
    body: "Publish a trip link for friends — or keep it private until you are ready.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-24 bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Built for travel planning
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          GlobeTrotter helps you design the trip — destinations, activities,
          budgets, and timelines in one place.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
