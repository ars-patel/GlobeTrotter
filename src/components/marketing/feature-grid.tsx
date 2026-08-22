import Link from "next/link";
import {
  Building2Icon,
  BusIcon,
  CalendarDaysIcon,
  MapIcon,
  MountainIcon,
  UsersIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = {
  Bus: BusIcon,
  Map: MapIcon,
  Calendar: CalendarDaysIcon,
  Mountain: MountainIcon,
  Users: UsersIcon,
  Building2: Building2Icon,
} as const;

export type MarketingCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  image_url: string | null;
};

export function FeatureGrid({
  categories,
}: {
  categories: MarketingCategory[];
}) {
  return (
    <section id="explore" className="scroll-mt-24 bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Your Way
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Choose a travel style, then search journeys that match your plan.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon =
              ICONS[cat.icon as keyof typeof ICONS] ?? MapIcon;
            return (
              <article
                key={cat.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative h-36 bg-muted">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-primary">
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-semibold">{cat.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                  <Link
                    href={`/journeys/search?from=Paris&to=Barcelona&departure=2026-09-01&passengers=1`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-4 w-fit"
                    )}
                  >
                    Browse trips
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {categories.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Categories will appear after seeding travel categories.
          </p>
        ) : null}
      </div>
    </section>
  );
}
