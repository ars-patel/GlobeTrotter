"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Globe2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/auth/session";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/search?type=city", label: "Search" },
  { href: "/trips", label: "Trips" },
  { href: "/schedule", label: "Schedule" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "User Profile" },
] as const;

function navActive(pathname: string, href: string) {
  const base = href.split("?")[0] ?? href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

type AppHeaderProps = {
  user: PublicUser | null;
};

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={user ? "/discover" : "/"} className="flex items-center gap-2 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted/50">
            <Globe2 className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">GlobeTrotter</span>
        </Link>

        {user ? (
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    active && "bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.first_name}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={loggingOut}
              >
                {loggingOut ? <Spinner data-icon="inline-start" /> : null}
                Log Out
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {user ? (
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-1 md:hidden">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "xs" }),
                  "shrink-0",
                  active && "bg-muted"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
