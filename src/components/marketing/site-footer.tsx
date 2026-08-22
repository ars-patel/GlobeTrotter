import Link from "next/link";
import { Globe2Icon } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Globe2Icon className="size-5" />
            <span className="text-lg font-semibold">GlobeTrotter</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">
            A personalized, collaborative platform to dream, design, and
            organize multi-city travel — with budgets, calendars, and sharing
            built in.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <a href="#features" className="hover:text-primary-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-primary-foreground">
                How it works
              </a>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary-foreground">
                Create account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link href="/login" className="hover:text-primary-foreground">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary-foreground">
                Sign up
              </Link>
            </li>
            <li>
              <Link
                href="/forgot-password"
                className="hover:text-primary-foreground"
              >
                Reset password
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} GlobeTrotter. Travel photos via Unsplash
          (free license).
        </p>
      </div>
    </footer>
  );
}
