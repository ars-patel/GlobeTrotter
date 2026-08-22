import Link from "next/link";
import {
  CalendarDaysIcon,
  MapIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/trips/new",
    title: "Plan New Trip",
    body: "Start a multi-city itinerary with dates, stops, and a budget.",
    icon: PlusCircleIcon,
  },
  {
    href: "/search?type=city",
    title: "Find destinations",
    body: "Browse cities and activities to add to your trip stops.",
    icon: SearchIcon,
  },
  {
    href: "/trips",
    title: "Manage my trips",
    body: "Open builders, budgets, calendars, and shared links.",
    icon: MapIcon,
  },
  {
    href: "/schedule",
    title: "View schedule",
    body: "See upcoming stops and activities on your calendar.",
    icon: CalendarDaysIcon,
  },
] as const;

export function DiscoverQuickActions() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          Quick actions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump into the planning tools you use most.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <a.icon className="size-5 text-primary transition group-hover:scale-105" />
            <h3 className="mt-3 font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
