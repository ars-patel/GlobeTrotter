import Link from "next/link";

export type MarketingCity = {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
  popularity: number;
};

export function DestinationRow({ cities }: { cities: MarketingCity[] }) {
  return (
    <section id="destinations" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Popular destinations
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse cities travelers plan most — then add them as stops on your
          trip.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => (
            <Link
              key={c.id}
              href={`/signup?next=${encodeURIComponent(`/search?q=${encodeURIComponent(c.name)}`)}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt=""
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-white/80">{c.country}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {cities.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Destinations will appear once the catalog is seeded.
          </p>
        ) : null}
      </div>
    </section>
  );
}
