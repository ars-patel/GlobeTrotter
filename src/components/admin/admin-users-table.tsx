"use client";

import { useState } from "react";
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
  created_at: string;
  trip_count: number;
};

export function AdminUsersTable({
  users: initial,
}: {
  users: AdminUserRow[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setRole(userId: string, role: "USER" | "ADMIN") {
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: data.user.role as "USER" | "ADMIN" } : u
        )
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
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
              <TableHead className="text-right">Trips</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "default" : "outline"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {u.trip_count}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.created_at}
                </TableCell>
                <TableCell className="text-right">
                  {u.role === "ADMIN" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === u.id}
                      onClick={() => void setRole(u.id, "USER")}
                    >
                      {busyId === u.id ? <Spinner /> : "Demote"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId === u.id}
                      onClick={() => void setRole(u.id, "ADMIN")}
                    >
                      {busyId === u.id ? <Spinner /> : "Make admin"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
