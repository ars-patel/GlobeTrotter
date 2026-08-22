import {
  BadgeDollarSignIcon,
  HeadphonesIcon,
  LockIcon,
  RadioIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: LockIcon,
    title: "Secure Booking",
    body: "Account-backed bookings with protected sessions.",
  },
  {
    icon: RadioIcon,
    title: "Real-Time Availability",
    body: "Seat counts come from live database queries.",
  },
  {
    icon: BadgeDollarSignIcon,
    title: "Transparent Pricing",
    body: "See journey fares before you confirm.",
  },
  {
    icon: TicketIcon,
    title: "Easy Booking",
    body: "Search, compare, and reserve in a few steps.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Trusted Operators",
    body: "Journeys are tied to rated coach operators.",
  },
  {
    icon: HeadphonesIcon,
    title: "Customer Support",
    body: "Help links and account tools when you need them.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Travel With Confidence
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Built for clear search, honest availability, and a simple path to book.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
