"use client";

import Link from "next/link";
import { Globe2Icon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/components/auth/auth-modal-context";

const LINKS = [
  { href: "#destinations", label: "Destinations" },
  { href: "#themes", label: "Plan" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#trending", label: "Inspiration" },
] as const;

export function SiteHeader() {
  const { openAuth } = useAuthModal();

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/20 backdrop-blur-sm">
            <Globe2Icon className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            GlobeTrotter
          </span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => openAuth("login")}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white hover:bg-white/10 hover:text-white"
            )}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => openAuth("login", "/trips/new")}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-white font-semibold text-primary hover:bg-white/90"
            )}
          >
            Book a trip
          </button>
        </div>
      </div>
    </header>
  );
}
