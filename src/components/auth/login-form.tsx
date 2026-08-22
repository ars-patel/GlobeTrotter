"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { PasswordField } from "@/components/auth/password-field";
import { AuthPhotoCircle } from "@/components/auth/auth-photo-circle";
import { loginSchema } from "@/lib/auth/schemas";
import { safeNextPath } from "@/lib/auth/safe-next";

export function LoginForm({
  nextPath: nextPathProp,
  embedded = false,
  onSwitchToSignup,
}: {
  nextPath?: string;
  embedded?: boolean;
  onSwitchToSignup?: () => void;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => nextPathProp ?? safeNextPath(searchParams.get("next")),
    [nextPathProp, searchParams]
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const nextErr: { identifier?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "identifier" || key === "password") {
          nextErr[key] = issue.message;
        }
      }
      setFieldErrors(nextErr);
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to log in");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Unable to log in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AuthPhotoCircle mode="display" />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.identifier) || undefined}>
          <FieldLabel htmlFor="identifier">Username</FieldLabel>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="Username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            aria-invalid={Boolean(fieldErrors.identifier)}
            required
          />
          {fieldErrors.identifier ? (
            <FieldError>{fieldErrors.identifier}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password ? (
            <FieldError>{fieldErrors.password}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Logging in…
          </>
        ) : (
          "Login"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        {embedded && onSwitchToSignup ? (
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={onSwitchToSignup}
          >
            Register
          </button>
        ) : (
          <Link
            href={
              nextPath !== "/discover"
                ? `/signup?next=${encodeURIComponent(nextPath)}`
                : "/signup"
            }
            className="font-medium text-foreground underline underline-offset-4"
          >
            Register
          </Link>
        )}
      </p>
    </form>
  );
}
