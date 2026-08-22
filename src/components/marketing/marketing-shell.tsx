"use client";

import type { ReactNode } from "react";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";

export function MarketingShell({ children }: { children: ReactNode }) {
  return <AuthModalProvider>{children}</AuthModalProvider>;
}
