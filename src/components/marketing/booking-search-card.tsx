"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DateField } from "@/components/marketing/date-field";
import { journeySearchSchema } from "@/lib/journeys";

export type DestinationOption = {
  id: string;
  name: string;
  country: string;
};

export function BookingSearchCard({
  destinations,
  compact = false,
}: {
  destinations: DestinationOption[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState<Date | undefined>(
    () => new Date("2026-09-05")
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cityNames = useMemo(
    () => destinations.map((d) => d.name).sort((a, b) => a.localeCompare(b)),
    [destinations]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      from,
      to,
      departure: departure ? format(departure, "yyyy-MM-dd") : "",
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      passengers: Number(passengers),
    };

    const parsed = journeySearchSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your search fields");
      return;
    }
    if (parsed.data.from.toLowerCase() === parsed.data.to.toLowerCase()) {
      setError("From and To must be different cities");
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({
        from: parsed.data.from,
        to: parsed.data.to,
        departure: parsed.data.departure,
        passengers: String(parsed.data.passengers),
      });
      if (parsed.data.returnDate) qs.set("return", parsed.data.returnDate);

      const res = await fetch(`/api/journeys/search?${qs.toString()}`);
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }
      router.push(`/journeys/search?${qs.toString()}`);
    } catch {
      setError("Unable to search right now. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      className={cnCard(compact)}
    >
      <CardContent className={compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                list="city-from-list"
                placeholder="Departure city"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
              <datalist id="city-from-list">
                {cityNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                list="city-to-list"
                placeholder="Arrival city"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
              <datalist id="city-to-list">
                {cityNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <DateField
              id="departure"
              label="Departure"
              value={departure}
              onChange={setDeparture}
              minDate={new Date()}
            />

            <DateField
              id="return"
              label="Return (optional)"
              value={returnDate}
              onChange={setReturnDate}
              minDate={departure ?? new Date()}
              placeholder="One way"
            />

            <div className="space-y-1.5">
              <Label htmlFor="passengers">Passengers</Label>
              <select
                id="passengers"
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              >
                {Array.from({ length: 8 }, (_, i) => String(i + 1)).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === "1" ? "passenger" : "passengers"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                Searching…
              </>
            ) : (
              <>
                <SearchIcon data-icon="inline-start" />
                Search Trips
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function cnCard(compact: boolean) {
  return compact
    ? "border-border/80 bg-background/95 shadow-lg backdrop-blur"
    : "border-border/80 bg-background shadow-xl shadow-black/10";
}
