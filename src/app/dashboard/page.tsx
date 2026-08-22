import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const screens = [
  { href: "/trips", title: "My Trips", description: "List and manage your itineraries" },
  { href: "/trips/new", title: "Create Trip", description: "Start a new multi-city plan" },
  { href: "/cities", title: "City Search", description: "Discover destinations" },
  { href: "/profile", title: "Profile", description: "Account and preferences" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Plan your next journey.
          </p>
        </div>
        <Link href="/trips/new" className={cn(buttonVariants())}>
          Plan New Trip
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {screens.map((screen) => (
          <Link key={screen.href} href={screen.href}>
            <Card className="h-full border-border shadow-none transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-base">{screen.title}</CardTitle>
                <CardDescription>{screen.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
