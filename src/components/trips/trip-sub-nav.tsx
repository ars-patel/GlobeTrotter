import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "builder", label: "Builder" },
  { href: "itinerary", label: "Itinerary" },
  { href: "calendar", label: "Calendar" },
  { href: "budget", label: "Budget" },
  { href: "share", label: "Share" },
] as const;

export function TripSubNav({
  tripId,
  active,
}: {
  tripId: string;
  active: (typeof LINKS)[number]["href"];
}) {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={`/trips/${tripId}/${link.href}`}
          className={cn(
            buttonVariants({
              variant: active === link.href ? "secondary" : "ghost",
              size: "sm",
            })
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
