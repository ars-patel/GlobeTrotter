"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ShareTripPanel({
  tripId,
  initialPublic,
  initialSlug,
}: {
  tripId: string;
  initialPublic: boolean;
  initialSlug: string | null;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [shareUrl, setShareUrl] = useState(
    initialSlug
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${initialSlug}`
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Share update failed");
      setIsPublic(Boolean(data.trip?.is_public));
      setShareUrl(data.shareUrl ?? "");
      setMessage(next ? "Trip is public" : "Trip is private");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="public">Public sharing</Label>
          <p className="text-xs text-muted-foreground">
            Anyone with the link can view a read-only itinerary
          </p>
        </div>
        <Switch
          id="public"
          checked={isPublic}
          disabled={loading}
          onCheckedChange={(v) => toggle(Boolean(v))}
        />
      </div>
      {loading ? <Spinner /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {shareUrl ? (
        <div className="space-y-2">
          <Label htmlFor="url">Public URL</Label>
          <div className="flex gap-2">
            <Input id="url" readOnly value={shareUrl} />
            <Button
              type="button"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              Copy
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
