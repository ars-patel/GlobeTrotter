import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type MarketingReview = {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_demo: boolean;
};

export function ReviewsSection({ reviews }: { reviews: MarketingReview[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Traveler reviews
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Feedback stored in PostgreSQL. Demo rows are labeled when seeded for
          development.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{r.author_name}</p>
                {r.is_demo ? (
                  <Badge variant="secondary">Demo seed</Badge>
                ) : null}
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                {Number(r.rating).toFixed(1)}
              </div>
              {r.title ? (
                <p className="mt-3 text-sm font-medium">{r.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {r.body}
              </p>
            </blockquote>
          ))}
        </div>

        {reviews.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No reviews yet. Add rows to the reviews table to show testimonials.
          </p>
        ) : null}
      </div>
    </section>
  );
}
