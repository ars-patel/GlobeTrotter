"use client";

import { CheckIcon } from "lucide-react";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type BookingStep = {
  id: string;
  label: string;
  shortLabel?: string;
};

type BookingStepperProps = {
  steps: BookingStep[];
  currentStep: number;
  maxReachedStep: number;
  onStepSelect?: (index: number) => void;
  className?: string;
};

export function BookingStepper({
  steps,
  currentStep,
  maxReachedStep,
  onStepSelect,
  className,
}: BookingStepperProps) {
  const total = steps.length;
  const percent = Math.round(((currentStep + 1) / total) * 100);

  return (
    <div className={cn("space-y-5", className)}>
      <Progress value={percent} className="w-full">
        <ProgressLabel>
          Step {currentStep + 1} of {total}
        </ProgressLabel>
        <ProgressValue />
      </Progress>

      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isComplete = index < currentStep;
          const isReachable = index <= maxReachedStep;
          const canSelect = Boolean(onStepSelect) && isReachable && !isCurrent;
          const segmentDone = index < currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-col items-center",
                index < total - 1 ? "flex-1" : "flex-none"
              )}
            >
              <div className="flex w-full items-center">
                <button
                  type="button"
                  disabled={!canSelect}
                  onClick={() => canSelect && onStepSelect?.(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.label}${isComplete ? ", completed" : isCurrent ? ", current" : ""}`}
                  className={cn(
                    "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-10",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary ring-4 ring-primary/15",
                    !isCurrent &&
                      !isComplete &&
                      "border-border bg-muted/50 text-muted-foreground",
                    canSelect && "cursor-pointer hover:border-primary/70",
                    !canSelect && !isCurrent && "cursor-default"
                  )}
                >
                  {isComplete ? (
                    <CheckIcon className="size-4" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < total - 1 ? (
                  <div
                    aria-hidden
                    className={cn(
                      "mx-1 h-0.5 min-w-2 flex-1 rounded-full sm:mx-2",
                      segmentDone ? "bg-primary" : "bg-border"
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "mt-2 max-w-[4.25rem] self-start text-center text-[10px] leading-tight font-medium sm:max-w-[5.5rem] sm:text-xs",
                  "translate-x-[calc(-50%+1.125rem)] sm:translate-x-[calc(-50%+1.25rem)]",
                  isCurrent || isComplete
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span className="sm:hidden">{step.shortLabel ?? step.label}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
