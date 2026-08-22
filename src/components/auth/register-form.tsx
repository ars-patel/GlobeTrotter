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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { PasswordField } from "@/components/auth/password-field";
import { AuthPhotoCircle } from "@/components/auth/auth-photo-circle";
import { signupSchema } from "@/lib/auth/schemas";
import { safeNextPath } from "@/lib/auth/safe-next";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  home_city: string;
  home_country: string;
  additional_info: string;
  username: string;
  password: string;
  confirm_password: string;
};

const initial: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  home_city: "",
  home_country: "",
  additional_info: "",
  username: "",
  password: "",
  confirm_password: "",
};

type FieldKey =
  | "first_name"
  | "last_name"
  | "email"
  | "password"
  | "confirm_password"
  | "username";

export function RegisterForm({
  nextPath: nextPathProp,
  embedded = false,
  onSwitchToLogin,
}: {
  nextPath?: string;
  embedded?: boolean;
  onSwitchToLogin?: () => void;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => nextPathProp ?? safeNextPath(searchParams.get("next")),
    [nextPathProp, searchParams]
  );

  const [form, setForm] = useState<FormState>(initial);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadPhotoIfNeeded(): Promise<string | undefined> {
    if (!photoFile) return undefined;
    const body = new FormData();
    body.append("file", photoFile);
    const res = await fetch("/api/uploads/avatar", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Photo upload failed");
    return data.url;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: "Passwords do not match" });
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      let photo_url: string | undefined;
      try {
        photo_url = await uploadPhotoIfNeeded();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Photo upload failed");
        setLoading(false);
        return;
      }

      const parsed = signupSchema.safeParse({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        home_city: form.home_city || undefined,
        home_country: form.home_country || undefined,
        additional_info: form.additional_info || undefined,
        username: form.username || undefined,
        photo_url,
        password: form.password,
      });

      if (!parsed.success) {
        const nextErr: Partial<Record<FieldKey, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0]) as FieldKey;
          if (
            key === "first_name" ||
            key === "last_name" ||
            key === "email" ||
            key === "password" ||
            key === "username"
          ) {
            nextErr[key] = issue.message;
          }
        }
        setFieldErrors(nextErr);
        setError(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Unable to create account. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AuthPhotoCircle
        mode="upload"
        value={photoPreview}
        disabled={loading}
        onChange={(file, preview) => {
          setPhotoFile(file);
          setPhotoPreview(preview);
        }}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors.first_name) || undefined}>
          <FieldLabel htmlFor="first_name">First Name</FieldLabel>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => setField("first_name", e.target.value)}
            disabled={loading}
            autoComplete="given-name"
            required
            aria-invalid={Boolean(fieldErrors.first_name)}
          />
          {fieldErrors.first_name ? (
            <FieldError>{fieldErrors.first_name}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.last_name) || undefined}>
          <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => setField("last_name", e.target.value)}
            disabled={loading}
            autoComplete="family-name"
            required
            aria-invalid={Boolean(fieldErrors.last_name)}
          />
          {fieldErrors.last_name ? (
            <FieldError>{fieldErrors.last_name}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            placeholder="you@example.com"
          />
          {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            disabled={loading}
            autoComplete="tel"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="home_city">City</FieldLabel>
          <Input
            id="home_city"
            value={form.home_city}
            onChange={(e) => setField("home_city", e.target.value)}
            disabled={loading}
            autoComplete="address-level2"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="home_country">Country</FieldLabel>
          <Input
            id="home_country"
            value={form.home_country}
            onChange={(e) => setField("home_country", e.target.value)}
            disabled={loading}
            autoComplete="country-name"
          />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="additional_info">Additional Information</FieldLabel>
          <Textarea
            id="additional_info"
            value={form.additional_info}
            onChange={(e) => setField("additional_info", e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Travel preferences, notes, or anything else"
          />
        </Field>

        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(fieldErrors.username) || undefined}
        >
          <FieldLabel htmlFor="username">Username (optional)</FieldLabel>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            disabled={loading}
            autoComplete="username"
            placeholder="Defaults from email if empty"
            aria-invalid={Boolean(fieldErrors.username)}
          />
          {fieldErrors.username ? (
            <FieldError>{fieldErrors.username}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordField
            id="password"
            value={form.password}
            onChange={(v) => setField("password", v)}
            disabled={loading}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters</p>
          {fieldErrors.password ? (
            <FieldError>{fieldErrors.password}</FieldError>
          ) : null}
        </Field>

        <Field
          data-invalid={Boolean(fieldErrors.confirm_password) || undefined}
        >
          <FieldLabel htmlFor="confirm_password">Confirm Password</FieldLabel>
          <PasswordField
            id="confirm_password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={(v) => setField("confirm_password", v)}
            disabled={loading}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.confirm_password)}
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
          "Register"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        {embedded && onSwitchToLogin ? (
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        ) : (
          <Link
            href={
              nextPath !== "/discover"
                ? `/login?next=${encodeURIComponent(nextPath)}`
                : "/login"
            }
            className="font-medium text-foreground underline underline-offset-4"
          >
            Login
          </Link>
        )}
      </p>
    </form>
  );
}
