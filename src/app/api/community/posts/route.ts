import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";

const postSchema = z.object({
  body: z.string().trim().min(1, "Post cannot be empty").max(2000),
});

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? 50),
    100
  );

  const { rows } = await query(
    `SELECT
       p.id, p.body, p.created_at,
       u.id AS author_id, u.first_name, u.last_name, u.photo_url, u.username
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return NextResponse.json({
    posts: rows.map((r) => ({
      id: r.id,
      body: r.body,
      created_at: r.created_at,
      author: {
        id: r.author_id,
        first_name: r.first_name,
        last_name: r.last_name,
        photo_url: r.photo_url,
        username: r.username,
      },
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { rows } = await query(
    `INSERT INTO community_posts (user_id, body)
     VALUES ($1, $2)
     RETURNING id, body, created_at`,
    [auth.user.id, parsed.data.body]
  );

  return NextResponse.json({ post: rows[0] }, { status: 201 });
}
