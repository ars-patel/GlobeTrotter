"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RemoveTripActivityButton({
  tripId,
  stopId,
  tripActivityId,
}: {
  tripId: string;
  stopId: string;
  tripActivityId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm("Remove this activity from the trip?")) return;
    setPending(true);
    try {
      const res = await fetch(
        `/api/trips/${tripId}/stops/${stopId}/activities/${tripActivityId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Failed to remove");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-destructive"
      disabled={pending}
      onClick={remove}
    >
      {pending ? (
        <>
          <Spinner data-icon="inline-start" />
          Removing…
        </>
      ) : (
        "Remove"
      )}
    </Button>
  );
}
