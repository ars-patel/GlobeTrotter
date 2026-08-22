import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md border-border shadow-md">
        <CardHeader className="pb-2 text-center">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-foreground"
          >
            GlobeTrotter
          </Link>
          <p className="text-sm text-muted-foreground">Login to plan your trips</p>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
