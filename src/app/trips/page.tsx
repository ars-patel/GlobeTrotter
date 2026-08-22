import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TripsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your upcoming and past itineraries.</p>
        </div>
        <Link href="/trips/new" className={cn(buttonVariants())}>
          Plan New Trip
        </Link>
      </div>
      <p className="mt-10 text-sm text-muted-foreground">No trips yet — create your first plan.</p>
    </div>
  );
}
