"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DeleteAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to delete account");
        return;
      }
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      setError("Failed to delete account");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-destructive/30 p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-destructive">
          Delete account
        </h2>
        <p className="text-sm text-muted-foreground">
          Permanently remove your account, trips, and saved destinations. This
          cannot be undone.
        </p>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button type="button" variant="destructive" size="sm" />
          }
        >
          Delete my account
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              All trips, itineraries, costs, and saved destinations will be
              removed. You will be signed out immediately.
            </AlertDialogDescription>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {pending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Deleting…
                </>
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
