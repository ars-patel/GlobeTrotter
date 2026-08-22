import Link from "next/link";
import { Globe2 } from "lucide-react";

export function AuthBrandHeader({
  title = "GlobeTrotter",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Link
        href="/"
        className="flex flex-col items-center rounded-lg outline-offset-4 focus-visible:outline-2"
      >
        <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted/40">
          <Globe2 className="size-7 text-foreground" aria-hidden />
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">{title}</h1>
      </Link>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      <Link
        href="/"
        className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to home
      </Link>
    </div>
  );
}
