import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-muted/40 to-background px-6 py-12">
      <Card className="w-full max-w-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <AuthBrandHeader subtitle="Create your GlobeTrotter account" />
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
