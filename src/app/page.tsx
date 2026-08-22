import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            GlobeTrotter
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
        <p className="text-sm text-muted-foreground">Travel planning, simplified</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          GlobeTrotter
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Design multi-city itineraries, estimate budgets, and share trips — built with
          Next.js, PostgreSQL, and shadcn/ui.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className={cn(buttonVariants())}>
            Get started
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
            Open dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
