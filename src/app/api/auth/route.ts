import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Auth routes — login / signup (to be implemented) */
export async function POST() {
  return NextResponse.json(
    { message: "Auth endpoint scaffolded. Implement login/signup next." },
    { status: 501 }
  );
}
