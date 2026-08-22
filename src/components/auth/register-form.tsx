"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { PasswordField } from "@/components/auth/password-field";
import { signupSchema } from "@/lib/auth/schemas";

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

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
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
      password: form.password,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
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
      router.push("/discover");
      router.refresh();
    } catch {
      setError("Unable to create account. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => setField("first_name", e.target.value)}
            disabled={loading}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => setField("last_name", e.target.value)}
            disabled={loading}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            disabled={loading}
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="home_city">City</Label>
          <Input
            id="home_city"
            value={form.home_city}
            onChange={(e) => setField("home_city", e.target.value)}
            disabled={loading}
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="home_country">Country</Label>
          <Input
            id="home_country"
            value={form.home_country}
            onChange={(e) => setField("home_country", e.target.value)}
            disabled={loading}
            autoComplete="country-name"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="username">Username (optional)</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            disabled={loading}
            autoComplete="username"
            placeholder="Defaults from email if empty"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="additional_info">Additional Information</Label>
          <Textarea
            id="additional_info"
            value={form.additional_info}
            onChange={(e) => setField("additional_info", e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            value={form.password}
            onChange={(v) => setField("password", v)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <PasswordField
            id="confirm_password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={(v) => setField("confirm_password", v)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Creating account…
          </>
        ) : (
          "Register now"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </p>
    </form>
  );
}
