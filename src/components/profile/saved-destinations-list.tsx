"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SavedDestination = {
  id: string;
  city_id: string;
  city_name: string;
  country: string;
  region: string | null;
  image_url: string | null;
};

type CityOption = {
  id: string;
  name: string;
  country: string;
};

export function SavedDestinationsList({
  initial,
}: {
  initial: SavedDestination[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [options, setOptions] = useState<CityOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setOptions([]);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const res = await fetch(
            `/api/cities?q=${encodeURIComponent(q.trim())}&limit=8`
          );
          const data = await res.json();
          if (res.ok) {
            setOptions(
              (data.cities ?? []).map(
                (c: { id: string; name: string; country: string }) => ({
                  id: c.id,
                  name: c.name,
                  country: c.country,
                })
              )
            );
          }
        } finally {
          setSearching(false);
        }
      })();
    }, 250);
    return () => window.clearTimeout(t);
  }, [q]);

  async function addCity(cityId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/saved-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_id: cityId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setItems((prev) => {
        const next = data.saved_destination as SavedDestination;
        if (prev.some((p) => p.id === next.id || p.city_id === next.city_id)) {
          return prev;
        }
        return [...prev, next].sort((a, b) =>
          a.city_name.localeCompare(b.city_name)
        );
      });
      setQ("");
      setOptions([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile/saved-destinations/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Saved destinations
        </h2>
        <p className="text-sm text-muted-foreground">
          Cities you want to visit or reuse when planning trips
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="save-city">Add a city</Label>
        <Input
          id="save-city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cities…"
          disabled={busy}
        />
        {searching ? (
          <p className="text-xs text-muted-foreground">Searching…</p>
        ) : null}
        {options.length > 0 ? (
          <ul className="max-h-40 overflow-auto rounded-lg border border-border">
            {options.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy || items.some((i) => i.city_id === c.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:opacity-50"
                  onClick={() => void addCity(c.id)}
                >
                  <span>
                    {c.name}
                    <span className="text-muted-foreground">, {c.country}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">Save</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved destinations yet. Search above or browse{" "}
          <Link href="/search" className="underline underline-offset-4">
            city search
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {item.city_name}
                  <span className="font-normal text-muted-foreground">
                    , {item.country}
                  </span>
                </p>
                {item.region ? (
                  <p className="text-xs text-muted-foreground">{item.region}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/search?q=${encodeURIComponent(item.city_name)}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  View
                </Link>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={busy}
                  onClick={() => void remove(item.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
