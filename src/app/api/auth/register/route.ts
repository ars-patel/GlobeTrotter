import { POST as signupPost } from "@/app/api/auth/signup/route";

export const runtime = "nodejs";

/** Spec alias for POST /api/auth/register */
export const POST = signupPost;
