"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  BookingStepper,
  type BookingStep,
} from "@/components/trips/booking-stepper";
import { CoverPhotoField } from "@/components/trips/cover-photo-field";
import { createTripSchema } from "@/lib/trips/schemas";

type Suggestion = { id: string; label: string };

const STEPS: BookingStep[] = [
  { id: "basics", label: "Basics", shortLabel: "Basics" },
  { id: "route", label: "Route", shortLabel: "Route" },
  { id: "cover", label: "Cover & budget", shortLabel: "Cover" },
  { id: "packing", label: "Packing", shortLabel: "Pack" },
  { id: "review", label: "Review", shortLabel: "Review" },
];

const STEP_SUBTITLES = [
  "Name your trip and set the travel window.",
  "Where does the journey start and end?",
  "Add a cover photo and optional budget limit.",
  "Choose packing suggestions for your dates.",
  "Confirm details, then open the itinerary builder.",
] as const;

function formatDateLabel(value: string) {
  if (!value) return "—";
  try {
    return new Date(value + "T12:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function TripForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPacking, setLoadingPacking] = useState(false);

  useEffect(() => {
    if (!startDate) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPacking(true);
      try {
        const res = await fetch(
          `/api/packing-suggestions?start_date=${encodeURIComponent(startDate)}`
        );
        const data = (await res.json()) as {
          suggestions?: Suggestion[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed packing suggestions");
        if (cancelled) return;
        const list = data.suggestions ?? [];
        setSuggestions(list);
        setSelected((prev) => {
          const next: Record<string, boolean> = {};
          for (const s of list) {
            next[s.id] = prev[s.id] ?? true;
          }
          return next;
        });
      } catch (e) {
        if (!cancelled) {
          setSuggestions([]);
          setError(e instanceof Error ? e.message : "Packing load failed");
        }
      } finally {
        if (!cancelled) setLoadingPacking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startDate]);

  function goTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    if (index > maxReached + 1) return;
    setError(null);
    setStep(index);
    setMaxReached((m) => Math.max(m, index));
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!name.trim()) return "Trip name is required";
      if (!startDate) return "Start date is required";
      if (!endDate) return "End date is required";
      if (endDate < startDate) return "End date must be on or after start date";
      return null;
    }
    if (index === 1) {
      if (!startPoint.trim()) return "Start point is required";
      if (!endPoint.trim()) return "End point is required";
      return null;
    }
    if (index === 2) {
      if (budgetLimit !== "" && Number.isNaN(Number(budgetLimit))) {
        return "Budget must be a valid number";
      }
      if (budgetLimit !== "" && Number(budgetLimit) < 0) {
        return "Budget cannot be negative";
      }
      return null;
    }
    return null;
  }

  function onContinue() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    goTo(step + 1);
  }

  function onBack() {
    setError(null);
    goTo(step - 1);
  }

  async function onSubmit() {
    setError(null);

    const packing_items = suggestions
      .filter((s) => selected[s.id])
      .map((s) => ({ label: s.label, checked: false }));

    const parsed = createTripSchema.safeParse({
      name,
      start_date: startDate,
      end_date: endDate,
      start_point: startPoint,
      end_point: endPoint,
      description: description || undefined,
      cover_photo: coverPhoto || undefined,
      budget_limit: budgetLimit === "" ? null : Number(budgetLimit),
      packing_items,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as {
        trip?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Unable to create trip");
        return;
      }
      router.push(`/trips/${data.trip!.id}/builder`);
      router.refresh();
    } catch {
      setError("Unable to create trip. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const packingCount = suggestions.filter((s) => selected[s.id]).length;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Trip booking
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Plan your trip
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEP_SUBTITLES[step]}
        </p>
      </header>

      <BookingStepper
        steps={STEPS}
        currentStep={step}
        maxReachedStep={maxReached}
        subtitle={STEP_SUBTITLES[step]}
        onStepSelect={(index) => {
          if (index < step) {
            goTo(index);
            return;
          }
          const msg = validateStep(step);
          if (msg) {
            setError(msg);
            return;
          }
          goTo(index);
        }}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="min-h-[280px] rounded-xl border border-border bg-card/30 p-5 sm:p-6">
        {step === 0 ? (
          <section className="space-y-5" aria-labelledby="step-basics">
            <div>
              <h2 id="step-basics" className="text-lg font-semibold">
                Basics
              </h2>
              <p className="text-sm text-muted-foreground">
                Name your trip and set the travel window.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Trip name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Europe summer loop"
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                  placeholder="What is this trip about?"
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="space-y-5" aria-labelledby="step-route">
            <div>
              <h2 id="step-route" className="text-lg font-semibold">
                Route
              </h2>
              <p className="text-sm text-muted-foreground">
                Where does the journey begin and end?
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_point">Start point</Label>
                <Input
                  id="start_point"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  disabled={loading}
                  placeholder="City or airport"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_point">End point</Label>
                <Input
                  id="end_point"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  disabled={loading}
                  placeholder="City or airport"
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-5" aria-labelledby="step-details">
            <div>
              <h2 id="step-details" className="text-lg font-semibold">
                Cover & budget
              </h2>
              <p className="text-sm text-muted-foreground">
                Optional cover photo upload and spending limit.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CoverPhotoField
                value={coverPhoto}
                onChange={setCoverPhoto}
                disabled={loading}
              />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="budget">Budget limit (optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  step="0.01"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. 2500"
                />
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-5" aria-labelledby="step-packing">
            <div>
              <h2 id="step-packing" className="text-lg font-semibold">
                Packing suggestions
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on your start date — toggle what you want to bring.
              </p>
            </div>
            {loadingPacking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner /> Loading suggestions…
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {startDate
                  ? "No suggestions for this date yet."
                  : "Go back and pick a start date to load packing ideas."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {suggestions.map((s) => (
                  <Card key={s.id} className="border-border shadow-none">
                    <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-3">
                      <Checkbox
                        checked={Boolean(selected[s.id])}
                        onCheckedChange={(v) =>
                          setSelected((prev) => ({
                            ...prev,
                            [s.id]: Boolean(v),
                          }))
                        }
                      />
                      <CardTitle className="text-sm leading-snug font-medium">
                        {s.label}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-5" aria-labelledby="step-review">
            <div>
              <h2 id="step-review" className="text-lg font-semibold">
                Review & confirm
              </h2>
              <p className="text-sm text-muted-foreground">
                Check everything below. Use Back or the step numbers to edit.
              </p>
            </div>

            <dl className="space-y-4 text-sm">
              <ReviewRow
                label="Trip"
                onEdit={() => goTo(0)}
                value={
                  <>
                    <span className="font-medium">{name || "—"}</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {formatDateLabel(startDate)} – {formatDateLabel(endDate)}
                    </span>
                    {description.trim() ? (
                      <span className="mt-1 block text-muted-foreground line-clamp-2">
                        {description}
                      </span>
                    ) : null}
                  </>
                }
              />
              <Separator />
              <ReviewRow
                label="Route"
                onEdit={() => goTo(1)}
                value={
                  <span>
                    {startPoint || "—"} → {endPoint || "—"}
                  </span>
                }
              />
              <Separator />
              <ReviewRow
                label="Cover & budget"
                onEdit={() => goTo(2)}
                value={
                  <div className="space-y-2">
                    {coverPhoto.trim() ? (
                      <div className="aspect-[16/9] max-w-xs overflow-hidden rounded-md border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPhoto}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No cover photo</span>
                    )}
                    <p className="text-muted-foreground">
                      Budget:{" "}
                      {budgetLimit === ""
                        ? "No limit"
                        : `$${Number(budgetLimit).toFixed(2)}`}
                    </p>
                  </div>
                }
              />
              <Separator />
              <ReviewRow
                label="Packing"
                onEdit={() => goTo(3)}
                value={
                  <span className="text-muted-foreground">
                    {packingCount} item{packingCount === 1 ? "" : "s"} selected
                  </span>
                }
              />
            </dl>
          </section>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={step === 0 || loading}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Back
        </Button>

        <p className="order-last w-full text-center text-xs text-muted-foreground sm:order-none sm:w-auto">
          {STEPS[step]?.label} · {step + 1}/{STEPS.length}
        </p>

        {isLast ? (
          <Button type="button" onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving…
              </>
            ) : (
              "Save trip"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onContinue} disabled={loading}>
            Continue
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-1">{value}</dd>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}
