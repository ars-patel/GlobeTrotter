import Link from "next/link";
import {
  BusIcon,
  MapIcon,
  PlusCircleIcon,
  SearchIcon,
  WalletIcon,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/trips/new",
    title: "Plan an itinerary",
    body: "Create a multi-city trip with dates, stops, and activities.",
    icon: PlusCircleIcon,
  },
  {
    href: "/journeys/search",
    title: "Book a journey",
    body: "Search bus routes by from, to, and departure date.",
    icon: BusIcon,
  },
  {
    href: "/search?type=city",
    title: "Find destinations",
    body: "Browse cities and activities from the live catalog.",
    icon: SearchIcon,
  },
  {
    href: "/trips",
    title: "Manage my trips",
    body: "Open builders, budgets, calendars, and shared links.",
    icon: MapIcon,
  },
] as const;

export function DiscoverQuickActions() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Start here
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
          What do you want to do?
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Discover is your hub after login — pick one clear next step.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <a.icon className="size-5" />
            </span>
            <h3 className="mt-3 text-base font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {a.body}
            </p>
          </Link>
        ))}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <WalletIcon className="size-3.5" />
        Tip: open any trip → Budget to track spend against your limit.
      </p>
    </section>
  );
}
