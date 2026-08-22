"use client";

import { Globe2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { QuickRegisterForm } from "@/components/auth/quick-register-form";
import type { AuthMode } from "@/components/auth/auth-modal-context";

export function AuthDialog({
  mode,
  nextPath,
  onOpenChange,
  onSwitchMode,
}: {
  mode: AuthMode | null;
  nextPath: string;
  onOpenChange: (open: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
}) {
  const open = mode !== null;
  const isSignup = mode === "signup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isSignup ? "max-h-[90vh] overflow-y-auto sm:max-w-md" : "sm:max-w-md"
        }
      >
        <DialogHeader className="items-center text-center sm:items-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-muted/50">
            <Globe2Icon className="size-6 text-foreground" aria-hidden />
          </div>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Register to book journeys and manage your trips."
              : "Log in to search, book, and manage reservations."}
          </DialogDescription>
        </DialogHeader>

        {isSignup ? (
          <QuickRegisterForm
            nextPath={nextPath}
            onSwitchToLogin={() => onSwitchMode("login")}
          />
        ) : (
          <LoginForm
            nextPath={nextPath}
            embedded
            onSwitchToSignup={() => onSwitchMode("signup")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
