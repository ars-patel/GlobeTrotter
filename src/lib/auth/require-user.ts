import { NextResponse } from "next/server";
import { getCurrentUser, type PublicUser } from "@/lib/auth/session";

export async function requireUser(): Promise<
  { user: PublicUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}
