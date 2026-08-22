"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyTripButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${slug}/copy`, { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=/share/${slug}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not copy trip");
        return;
      }
      router.push(`/trips/${data.trip.id}/builder`);
      router.refresh();
    } catch {
      setError("Could not copy trip");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={copy} disabled={pending}>
        {pending ? "Copying…" : "Copy Trip"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
