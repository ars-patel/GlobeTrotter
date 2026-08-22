"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { z } from "zod";
import { safeNextPath } from "@/lib/auth/safe-next";

const quickSignupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name is required").max(120),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export function QuickRegisterForm({
  nextPath = "/discover",
  onSwitchToLogin,
}: {
  nextPath?: string;
  onSwitchToLogin?: () => void;
}) {
  const router = useRouter();
  const dest = safeNextPath(nextPath);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const parsed = quickSignupSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirm_password: confirm,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] = issue.message;
      }
      setFieldErrors(next);
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const parts = parsed.data.full_name.split(/\s+/);
    const first_name = parts[0] ?? "Traveler";
    const last_name = parts.slice(1).join(" ") || "Guest";

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        return;
      }
      setSuccess(true);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Unable to create account. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>Account created. Redirecting…</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.full_name) || undefined}>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            autoComplete="name"
            required
          />
          {fieldErrors.full_name ? (
            <FieldError>{fieldErrors.full_name}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
          <FieldLabel htmlFor="reg_email">Email</FieldLabel>
          <Input
            id="reg_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />
          {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
          <FieldLabel htmlFor="reg_password">Password</FieldLabel>
          <PasswordField
            id="reg_password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            autoComplete="new-password"
          />
          {fieldErrors.password ? (
            <FieldError>{fieldErrors.password}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.confirm_password) || undefined}>
          <FieldLabel htmlFor="reg_confirm">Confirm password</FieldLabel>
          <PasswordField
            id="reg_confirm"
            value={confirm}
            onChange={setConfirm}
            disabled={loading}
            autoComplete="new-password"
          />
          {fieldErrors.confirm_password ? (
            <FieldError>{fieldErrors.confirm_password}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-4"
          onClick={onSwitchToLogin}
        >
          Log in
        </button>
      </p>
    </form>
  );
}
