import Link from "next/link";
import { AddCityToTripButton } from "@/components/search/add-city-to-trip-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CitySearchItem = {
  id: string;
  name: string;
  country: string;
  region: string | null;
  cost_index: string | number;
  popularity: number;
  image_url?: string | null;
};

export function CitySearchCard({
  city,
  tripId,
}: {
  city: CitySearchItem;
  tripId?: string;
}) {
  return (
    <Card className="border-border shadow-none">
      <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <CardTitle className="text-base">{city.name}</CardTitle>
          <CardDescription>
            {city.country}
            {city.region ? ` · ${city.region}` : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Popularity {city.popularity}</Badge>
            <Badge variant="outline">
              Cost index ×{Number(city.cost_index).toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2">
        <AddCityToTripButton
          cityId={city.id}
          cityName={city.name}
          preferredTripId={tripId}
        />
        <Link
          href={`/search?type=activity&q=${encodeURIComponent(city.name)}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View activities
        </Link>
      </CardFooter>
    </Card>
  );
}
