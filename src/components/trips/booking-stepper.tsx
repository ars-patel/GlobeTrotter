"use client";

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
  /** overlap = large white card; navbar = compact steps in sticky header */
  variant?: "overlap" | "navbar";
  className?: string;
};

export function BookingStepper({
  steps,
  currentStep,
  maxReachedStep,
  onStepSelect,
  variant = "overlap",
  className,
}: BookingStepperProps) {
  const isNav = variant === "navbar";

  return (
    <ol className={cn("relative flex w-full items-start", className)}>
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isComplete = index < currentStep;
        const isReachable = index <= maxReachedStep;
        const canSelect = Boolean(onStepSelect) && isReachable && !isCurrent;
        const isLast = index === steps.length - 1;
        const lineFilled = index < currentStep;

        return (
          <li
            key={step.id}
            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
          >
            <div className="relative flex h-8 w-full items-center justify-center sm:h-9">
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-px -translate-y-1/2",
                    isNav
                      ? lineFilled
                        ? "bg-white"
                        : "bg-white/35"
                      : lineFilled
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
              ) : null}

              <button
                type="button"
                disabled={!canSelect}
                onClick={() => canSelect && onStepSelect?.(index)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step.label}${isComplete ? ", completed" : isCurrent ? ", current" : ""}`}
                className={cn(
                  "relative z-1 flex shrink-0 items-center justify-center rounded-full font-semibold transition-all outline-none focus-visible:ring-2",
                  isNav &&
                    isCurrent &&
                    "size-7 bg-white text-xs text-primary focus-visible:ring-white/50 sm:size-8",
                  isNav &&
                    isComplete &&
                    "size-5 bg-white text-[10px] text-primary sm:size-6",
                  isNav &&
                    !isCurrent &&
                    !isComplete &&
                    "size-2.5 bg-white/80 sm:size-3",
                  !isNav &&
                    "size-10 text-sm focus-visible:ring-primary/40 sm:size-11",
                  !isNav &&
                    (isCurrent || isComplete) &&
                    "border border-primary bg-primary text-primary-foreground shadow-sm",
                  !isNav &&
                    !isCurrent &&
                    !isComplete &&
                    "border border-border bg-muted text-muted-foreground",
                  canSelect && "cursor-pointer hover:opacity-90",
                  !canSelect && !isCurrent && "cursor-default"
                )}
              >
                {isNav ? (
                  isCurrent || isComplete ? (
                    index + 1
                  ) : (
                    <span className="sr-only">{index + 1}</span>
                  )
                ) : isComplete ? (
                  index + 1
                ) : (
                  index + 1
                )}
              </button>
            </div>

            <span
              className={cn(
                "mt-1 max-w-[4.75rem] truncate text-[10px] leading-tight font-medium sm:max-w-none sm:text-xs",
                isNav && "text-white/90",
                isNav && isCurrent && "font-semibold text-white",
                !isNav && "mt-2",
                !isNav &&
                  (isCurrent || isComplete
                    ? "text-foreground"
                    : "text-muted-foreground")
              )}
            >
              <span className="sm:hidden">{step.shortLabel ?? step.label}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
