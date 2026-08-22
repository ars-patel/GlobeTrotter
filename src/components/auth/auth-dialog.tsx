"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
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
          isSignup
            ? "max-h-[90vh] overflow-y-auto sm:max-w-2xl"
            : "sm:max-w-md"
        }
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{isSignup ? "Registration" : "Login"}</DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Create your GlobeTrotter account"
              : "Log in to GlobeTrotter"}
          </DialogDescription>
        </DialogHeader>

        {isSignup ? (
          <RegisterForm
            nextPath={nextPath}
            embedded
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
