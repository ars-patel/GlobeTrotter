"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function BookJourneyButton({
  journeyId,
  passengers = 1,
}: {
  journeyId: string;
  passengers?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function book() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journey_id: journeyId, passengers }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Booking failed");
        return;
      }
      router.push("/bookings");
      router.refresh();
    } catch {
      setError("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button onClick={() => void book()} disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Booking…
          </>
        ) : (
          "Confirm booking"
        )}
      </Button>
    </div>
  );
}
