import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DestinationItem = {
  id: string;
  name: string;
  country: string;
  region: string | null;
  cost_index: string | number;
  popularity: number;
  image_url: string | null;
};

export function DestinationCard({ city }: { city: DestinationItem }) {
  return (
    <Link href={`/search?type=city&q=${encodeURIComponent(city.name)}`}>
      <Card className="h-full overflow-hidden border-border shadow-none transition-colors hover:bg-muted/40">
        <div className="aspect-[4/3] bg-muted">
          {city.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={city.image_url}
              alt={city.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {city.name}
            </div>
          )}
        </div>
        <CardHeader className="gap-2 p-3">
          <CardTitle className="text-sm">{city.name}</CardTitle>
          <CardDescription className="text-xs">
            {city.country}
            {city.region ? ` · ${city.region}` : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">Pop {city.popularity}</Badge>
            <Badge variant="outline">Cost ×{Number(city.cost_index).toFixed(2)}</Badge>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
