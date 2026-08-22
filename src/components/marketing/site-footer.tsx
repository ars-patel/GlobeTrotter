"use client";

import Link from "next/link";
import { Globe2Icon, Share2Icon } from "lucide-react";
import { useAuthModal } from "@/components/auth/auth-modal-context";

export function SiteFooter() {
  const { openAuth } = useAuthModal();

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2Icon className="size-5" />
            <span className="font-display text-xl font-bold">GlobeTrotter</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-background/70">
            Personalized multi-city travel planning — itineraries, budgets, and
            sharing in one place.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Social"
              className="rounded-full border border-background/20 p-2 hover:bg-background/10"
            >
              <Share2Icon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
            Product
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">
            <li>
              <a href="#destinations" className="hover:text-background">
                Destinations
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-background">
                How to book
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-background">
                Features
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
            Plan
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">
            <li>
              <button
                type="button"
                className="hover:text-background"
                onClick={() => openAuth("signup", "/trips/new")}
              >
                Plan New Trip
              </button>
            </li>
            <li>
              <Link href="/discover" className="hover:text-background">
                Discover
              </Link>
            </li>
            <li>
              <Link href="/trips" className="hover:text-background">
                My Trips
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-background">
                Community
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background/50">
            Account
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-background/75">
            <li>
              <button
                type="button"
                className="hover:text-background"
                onClick={() => openAuth("login")}
              >
                Login
              </button>
            </li>
            <li>
              <button
                type="button"
                className="hover:text-background"
                onClick={() => openAuth("signup")}
              >
                Sign up
              </button>
            </li>
            <li>
              <a
                href="mailto:hello@globetrotter.app"
                className="hover:text-background"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-background/50 sm:px-6">
          © {new Date().getFullYear()} GlobeTrotter. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
