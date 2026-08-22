"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { SocialShareButtons } from "@/components/trips/social-share-buttons";
import { cn } from "@/lib/utils";

export function ShareTripPanel({
  tripId,
  tripName,
  initialPublic,
  initialSlug,
  appOrigin,
}: {
  tripId: string;
  tripName: string;
  initialPublic: boolean;
  initialSlug: string | null;
  appOrigin: string;
}) {
  const origin = appOrigin.replace(/\/$/, "");
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientOrigin, setClientOrigin] = useState(origin);

  // Soft-nav between trips reuses this client component — always sync from props.
  useEffect(() => {
    setIsPublic(initialPublic);
    setSlug(initialSlug);
    setError(null);
    setMessage(null);
  }, [tripId, initialPublic, initialSlug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientOrigin(window.location.origin);
    }
  }, []);

  const shareUrl =
    isPublic && slug ? `${clientOrigin}/share/${encodeURIComponent(slug)}` : "";

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

      const nextPublic = Boolean(data.trip?.is_public);
      const nextSlug =
        typeof data.trip?.share_slug === "string" ? data.trip.share_slug : null;

      setIsPublic(nextPublic);
      setSlug(nextSlug);
      setMessage(
        nextPublic
          ? `“${tripName}” is public — link is ready to share`
          : `“${tripName}” is private again`
      );
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
          <Label htmlFor={`public-${tripId}`}>Public sharing</Label>
          <p className="text-xs text-muted-foreground">
            Anyone with the link can view a read-only itinerary for{" "}
            <span className="font-medium text-foreground">{tripName}</span> and
            copy the trip
          </p>
        </div>
        <Switch
          id={`public-${tripId}`}
          checked={isPublic}
          disabled={loading}
          onCheckedChange={(v) => void toggle(Boolean(v))}
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
      {shareUrl && slug ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`url-${tripId}`}>Public URL</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id={`url-${tripId}`}
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigator.clipboard.writeText(shareUrl)}
              >
                Copy
              </Button>
              <Link
                href={`/share/${encodeURIComponent(slug)}`}
                target="_blank"
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                Open
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Social media</Label>
            <SocialShareButtons url={shareUrl} title={tripName} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Turn on public sharing to get a link and social share buttons.
        </p>
      )}
    </div>
  );
}
