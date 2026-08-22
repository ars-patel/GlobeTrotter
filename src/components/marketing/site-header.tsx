import Link from "next/link";
import { Globe2Icon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#destinations", label: "Destinations" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#trending", label: "Trending" },
] as const;

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
            <Globe2Icon className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            GlobeTrotter
          </span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-white text-primary hover:bg-white/90"
            )}
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
