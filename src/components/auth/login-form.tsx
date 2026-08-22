"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PasswordField } from "@/components/auth/password-field";
import { loginSchema } from "@/lib/auth/schemas";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
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
      router.push("/discover");
      router.refresh();
    } catch {
      setError("Unable to log in. Check your connection and try again.");
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

      <div className="space-y-2">
        <Label htmlFor="identifier">Username</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          placeholder="username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
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
        />
      </div>

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
        <Link href="/signup" className="underline underline-offset-4">
          Register now
        </Link>
      </p>
    </form>
  );
}
