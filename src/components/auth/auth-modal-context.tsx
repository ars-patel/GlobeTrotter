"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  Suspense,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safe-next";
import { AuthDialog } from "@/components/auth/auth-dialog";

export type AuthMode = "login" | "signup";

type AuthModalContextValue = {
  openAuth: (mode: AuthMode, next?: string) => void;
  closeAuth: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function useAuthModalOptional() {
  return useContext(AuthModalContext);
}

function AuthModalProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [nextOverride, setNextOverride] = useState<string | null>(null);

  const nextFromUrl = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );
  const nextPath = nextOverride ?? nextFromUrl;

  const syncUrl = useCallback(
    (nextMode: AuthMode | null, next?: string | null) => {
      if (pathname !== "/" && !pathname.startsWith("/journeys")) return;
      const params = new URLSearchParams(searchParams.toString());
      if (nextMode) {
        params.set("auth", nextMode);
      } else {
        params.delete("auth");
      }
      if (next && next !== "/discover") {
        params.set("next", next);
      } else if (!nextMode) {
        params.delete("next");
      }
      const qs = params.toString();
      const base = pathname.startsWith("/journeys") ? pathname : "/";
      router.replace(qs ? `${base}?${qs}` : base, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const openAuth = useCallback(
    (nextMode: AuthMode, next?: string) => {
      if (next) setNextOverride(next);
      setMode(nextMode);
      syncUrl(nextMode, next ?? nextOverride ?? nextFromUrl);
    },
    [nextFromUrl, nextOverride, syncUrl]
  );

  const closeAuth = useCallback(() => {
    setMode(null);
    setNextOverride(null);
    syncUrl(null, null);
  }, [syncUrl]);

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "signup") {
      setMode(auth);
    } else {
      setMode(null);
    }
  }, [searchParams]);

  const value = useMemo(
    () => ({ openAuth, closeAuth }),
    [openAuth, closeAuth]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthDialog
        mode={mode}
        nextPath={nextPath}
        onOpenChange={(open) => {
          if (!open) closeAuth();
        }}
        onSwitchMode={(m) => openAuth(m, nextOverride ?? nextFromUrl)}
      />
    </AuthModalContext.Provider>
  );
}

const stubValue: AuthModalContextValue = {
  openAuth: () => undefined,
  closeAuth: () => undefined,
};

export function AuthModalProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <AuthModalContext.Provider value={stubValue}>
          {children}
        </AuthModalContext.Provider>
      }
    >
      <AuthModalProviderInner>{children}</AuthModalProviderInner>
    </Suspense>
  );
}
