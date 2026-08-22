"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DeleteCostButton({
  tripId,
  costId,
}: {
  tripId: string;
  costId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this cost line?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/costs/${costId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Failed to delete");
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
      {pending ? <Spinner /> : "Delete"}
    </Button>
  );
}
