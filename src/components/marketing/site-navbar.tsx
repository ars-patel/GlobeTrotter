"use client";

import Link from "next/link";
import {
  CalendarDaysIcon,
  Globe2Icon,
  MapIcon,
  MenuIcon,
  RouteIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "#destinations", label: "Destinations" },
  { href: "#how-it-works", label: "How to book" },
  { href: "#features", label: "Features" },
] as const;

type MeUser = {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
};

export function SiteNavbar() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: MeUser };
        return data.user ?? null;
      })
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Globe2Icon className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            GlobeTrotter
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/trips/new"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden font-semibold sm:inline-flex"
                )}
              >
                Plan New Trip
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2"
                  )}
                >
                  <UserIcon className="size-4" />
                  <span className="hidden max-w-28 truncate sm:inline">
                    {user.name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/discover";
                    }}
                  >
                    Discover
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/trips";
                    }}
                  >
                    My Trips
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/profile";
                    }}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void logout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex"
                )}
              >
                Login
              </Link>
              <Link
                href="/signup?next=/trips/new"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden font-semibold sm:inline-flex"
                )}
              >
                Plan New Trip
              </Link>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "lg:hidden"
              )}
            >
              <MenuIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left text-xl font-bold">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={`m-${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                {user ? (
                  <>
                    <Link
                      href="/trips/new"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants(), "w-full")}
                    >
                      Plan New Trip
                    </Link>
                    <Link
                      href="/discover"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full"
                      )}
                    >
                      Open Discover
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup?next=/trips/new"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants(), "w-full")}
                    >
                      Plan New Trip
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full"
                      )}
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
                <RouteIcon className="size-3.5" />
                Multi-city itineraries, budgets, and sharing.
              </p>
              <div className="mt-3 flex gap-3 text-muted-foreground">
                <MapIcon className="size-3.5" />
                <CalendarDaysIcon className="size-3.5" />
                <WalletIcon className="size-3.5" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
