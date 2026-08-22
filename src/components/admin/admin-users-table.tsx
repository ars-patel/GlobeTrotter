"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export type AdminUserRow = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  role: "USER" | "ADMIN";
  is_suspended: boolean;
  created_at: string;
  trip_count: number;
};

export function AdminUsersTable({
  users: initial,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initial);
  }, [initial]);

  async function patchUser(
    userId: string,
    body: { role?: "USER" | "ADMIN"; is_suspended?: boolean }
  ) {
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update user");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: data.user.role as "USER" | "ADMIN",
                is_suspended: Boolean(data.user.is_suspended),
              }
            : u
        )
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(userId: string, label: string) {
    const ok = window.confirm(
      `Delete ${label}? Their trips, bookings, and posts will be permanently removed.`
    );
    if (!ok) return;

    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Trips</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {u.name}
                        {isSelf ? (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "outline"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.trip_count}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.created_at}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {u.role === "ADMIN" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy || isSelf}
                          onClick={() => void patchUser(u.id, { role: "USER" })}
                        >
                          {busy ? <Spinner /> : "Demote"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void patchUser(u.id, { role: "ADMIN" })}
                        >
                          {busy ? <Spinner /> : "Make admin"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy || isSelf}
                        onClick={() =>
                          void patchUser(u.id, {
                            is_suspended: !u.is_suspended,
                          })
                        }
                      >
                        {busy ? (
                          <Spinner />
                        ) : u.is_suspended ? (
                          "Unsuspend"
                        ) : (
                          "Suspend"
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busy || isSelf}
                        onClick={() => void deleteUser(u.id, u.name)}
                      >
                        {busy ? <Spinner /> : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
