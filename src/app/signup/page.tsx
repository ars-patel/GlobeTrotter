import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { RegisterForm } from "@/components/auth/register-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-2xl border-border shadow-md">
        <CardHeader className="pb-2 text-center">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-foreground"
          >
            GlobeTrotter
          </Link>
          <p className="text-sm text-muted-foreground">
            Create your traveler account
          </p>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
