import { Suspense } from "react";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-muted/40 to-background px-6 py-16">
      <Card className="w-full max-w-md border-border shadow-none">
        <CardHeader className="pb-2">
          <AuthBrandHeader subtitle="Sign in to manage your trips" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
