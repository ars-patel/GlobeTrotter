import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProfileTripCardData = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export function ProfileTripRow({
  title,
  trips,
}: {
  title: string;
  trips: ProfileTripCardData[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {trips.slice(0, 6).map((t) => (
            <Card key={t.id} className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription>
                  {t.start_date} – {t.end_date}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  href={`/trips/${t.id}/itinerary`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  View
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
