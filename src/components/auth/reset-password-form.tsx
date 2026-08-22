"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetPasswordSchema } from "@/lib/auth/schemas";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Unable to reset password");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError("Unable to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!token ? (
        <Alert variant="destructive">
          <AlertDescription>
            Missing reset token. Request a new link from{" "}
            <Link href="/forgot-password" className="underline underline-offset-4">
              forgot password
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          disabled={loading || !token}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <PasswordField
          id="confirm"
          name="confirm"
          value={confirm}
          onChange={setConfirm}
          disabled={loading || !token}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !token}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Updating…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
